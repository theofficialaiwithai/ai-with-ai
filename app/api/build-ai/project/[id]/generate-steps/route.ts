export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { db } from '@/db'
import { buildProjects, projectSteps } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const BuildStepsSchema = z.object({
  steps: z.array(z.object({
    stepNumber: z.number().int(),
    stepName: z.string().describe('Short name for this build step (5-10 words)'),
    promptText: z.string().describe(
      'Complete, self-contained Claude Code prompt for this step. Must include all context from the PRD needed to execute the step (app name, tech stack, relevant features). Never references previous steps or assumes prior context. Written as a direct instruction to Claude Code.'
    ),
    verifyChecklist: z.array(z.string()).min(2).max(6).describe(
      'Specific, testable checklist items that confirm this step is complete'
    ),
  })).min(1).max(15),
})

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const projectId = parseInt(id, 10)
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

    const [project] = await db
      .select()
      .from(buildProjects)
      .where(and(eq(buildProjects.id, projectId), eq(buildProjects.userId, userId)))

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Server-side governance gate
    if (project.domainRiskFlagged && !project.domainRiskAcknowledged) {
      return NextResponse.json(
        { error: 'Domain risk must be acknowledged before generating build steps' },
        { status: 403 }
      )
    }

    if (project.status !== 'prd_generated') {
      return NextResponse.json(
        { error: `Cannot generate steps from status '${project.status}'` },
        { status: 409 }
      )
    }

    const prdMarkdown = project.prdMarkdown ?? ''
    if (!prdMarkdown.trim()) {
      return NextResponse.json({ error: 'Project has no PRD to expand' }, { status: 400 })
    }

    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const prompt = `You are a senior software engineer and build coach. You have been given a Product Requirements Document (PRD) for an app that a developer will build with Claude Code.

The PRD contains an "MVP Build Order" section that lists the build steps as brief one-liners. Your job is to expand EACH of those steps into a full, self-contained, pasteable Claude Code prompt.

## Critical rules for every step prompt:
1. **Fully self-contained** — Each prompt must work even if Claude Code has never seen any prior steps. Include all context from the PRD that Claude Code needs: app name, tech stack, database schema (if relevant), API routes, styling conventions.
2. **Never reference prior steps** — Do not say "continuing from the previous step", "as we built before", or assume any files exist.
3. **Specific and actionable** — Name the exact files, functions, and behaviors expected. Not "add auth" but "Create a Clerk middleware at middleware.ts that protects /dashboard and /api/... routes".
4. **Follow the step numbering exactly** — Use the same step numbers and sequence as the PRD's MVP Build Order section.

## PRD to expand:

---
${prdMarkdown}
---

Expand the MVP Build Order into full step prompts. For each step, also provide a specific verification checklist (what the developer should check/test to confirm the step worked).`

    let result: z.infer<typeof BuildStepsSchema>
    try {
      const { object } = await generateObject({
        model: anthropic('claude-haiku-4-5-20251001'),
        schema: BuildStepsSchema,
        prompt,
        maxTokens: 3000,
      })
      result = object
    } catch (err) {
      console.error('[generate-steps] Anthropic call failed:', err)
      return NextResponse.json(
        { error: 'Step generation failed — check server logs' },
        { status: 500 }
      )
    }

    // Insert steps and update status
    await db.insert(projectSteps).values(
      result.steps.map(s => ({
        projectId,
        stepNumber: s.stepNumber,
        stepName: s.stepName,
        promptText: s.promptText,
        verifyChecklist: s.verifyChecklist,
      }))
    )

    await db
      .update(buildProjects)
      .set({ status: 'building', updatedAt: new Date() })
      .where(eq(buildProjects.id, projectId))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[generate-steps] handler error:', err)
    console.error('[generate-steps] stack:', err instanceof Error ? err.stack : '(no stack)')
    return NextResponse.json(
      { error: `Handler failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }
}
