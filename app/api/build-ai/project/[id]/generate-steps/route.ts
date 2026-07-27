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
    stepName: z.string().describe('Short name for this build step (5-8 words)'),
    promptText: z.string().describe(
      'Claude Code prompt for this step — 3 to 5 sentences MAXIMUM. Name exact file paths to create or edit, specific functions or routes to implement, and any libraries to install. Self-contained (no references to other steps) but BRIEF.'
    ),
    verifyChecklist: z.array(z.string()).min(2).max(3).describe(
      '2-3 quick checks that confirm this step is complete'
    ),
  })).min(3).max(8),
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

    const prompt = `You are a build coach. Expand the MVP Build Order from this PRD into concise Claude Code prompts.

RULES:
- Maximum 8 steps total
- Each promptText: 3-5 sentences MAXIMUM — specific but brief
- Name exact file paths, routes, and libraries; never say "as before" or reference other steps
- 2-3 verify items per step only

PRD:
---
${prdMarkdown}
---`

    let result: z.infer<typeof BuildStepsSchema>
    try {
      const { object } = await generateObject({
        model: anthropic('claude-haiku-4-5-20251001'),
        schema: BuildStepsSchema,
        prompt,
        maxOutputTokens: 2000,
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
