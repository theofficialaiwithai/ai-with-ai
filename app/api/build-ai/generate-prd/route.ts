export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { db } from '@/db'
import { buildProjects, generationLogs, prdSections } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { checkDomainRisk } from '@/lib/domain-risk'

function deriveTitle(ideaDescription: string): string {
  const trimmed = ideaDescription.trim()
  const sentence = trimmed.split(/[.!?\n]/)[0].trim()
  return sentence.length > 60 ? sentence.slice(0, 57) + '…' : sentence
}

function parsePrdIntoSections(prdText: string): { name: string; content: string }[] {
  const chunks = prdText.split(/\n(?=## )/)
  const sections: { name: string; content: string }[] = []
  for (const chunk of chunks) {
    const trimmed = chunk.trim()
    if (!trimmed.startsWith('## ')) continue
    const newlineIdx = trimmed.indexOf('\n')
    if (newlineIdx === -1) {
      sections.push({ name: trimmed.slice(3).trim(), content: '' })
    } else {
      const name = trimmed.slice(3, newlineIdx).trim()
      const content = trimmed.slice(newlineIdx + 1).trim()
      sections.push({ name, content })
    }
  }
  return sections
}

export async function POST(req: Request) {
  try {
    console.log('[generate-prd] handler start')

    const { userId } = await auth()
    console.log('[generate-prd] auth resolved, userId:', userId ?? 'null')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    console.log('[generate-prd] request body keys:', Object.keys(body))
    const { ideaDescription, targetUser, coreFeature, buildTool } = body
    if (!ideaDescription || !targetUser || !coreFeature || !buildTool) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const buildToolLabel: Record<string, string> = {
      claude_code: 'Claude Code',
      cursor: 'Cursor',
      replit: 'Replit',
      lovable: 'Lovable',
    }
    const toolLabel = buildToolLabel[buildTool] ?? buildTool

    const [{ n: projectCount }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(buildProjects)
      .where(eq(buildProjects.userId, userId))
    console.log('[generate-prd] project count:', projectCount)

    const prompt = `You are a senior product strategist helping an indie builder create a focused, actionable PRD.

The builder wants to build the following:
- Idea: ${ideaDescription}
- Target user: ${targetUser}
- Core feature: ${coreFeature}
- Build tool: ${toolLabel}

Generate a complete PRD in Markdown. Include ALL 13 sections below in EXACTLY this order. Do not skip any section.

## Overview
One paragraph describing the product. Then three punchy taglines as a bullet list.

## Problem
One specific paragraph: what pain does this solve and why current alternatives fall short.

## Target Users
- **Primary:** [who this is built for]
- **Secondary:** [who might also benefit]
- **Not the target:** [who this is explicitly not for — important for scope]

## Core Value Proposition
One sentence: "[Product] helps [user] do [outcome] without [friction]."

## MVP Features
5–7 features. Each on its own line: **Feature Name** — recommended: [one-sentence description] — confirm before building.

## Out of Scope (v1)
Bullet list of things explicitly NOT included in v1. Be ruthless.

## Brand & Design Direction
**Colors:** Specific hex values for Background, Surface, Primary, Text, Error.
**Typography:** Recommended heading font and body font (name the actual fonts).
**Visual Principles:** 2–3 one-sentence principles that define the look and feel.

## Tech Stack
Markdown table with columns: Layer | Recommended Choice | Notes.
Rows: Frontend, Backend/API, Database, Auth, Hosting, and any key third-party services.
Phrase each choice as "recommended: X — confirm before building." Tailor to ${toolLabel}.

## Data Schema
Write the actual SQL CREATE TABLE statements for every core table this app needs.
Use standard PostgreSQL syntax. Include primary keys, foreign keys, and important constraints.
If no persistent data is needed, write exactly: "No persistent storage required — standard session state only."

## App Routes
Markdown table with columns: Route | Method | Description.
List every page route (GET) and API endpoint (POST/PATCH/DELETE) the MVP needs.

## Core Algorithm / Logic
Write the central non-trivial logic in pseudocode. Focus on the business logic that makes this app work, not boilerplate.
If the app is pure CRUD with no non-trivial logic, write exactly: "No core algorithm required — standard CRUD."

## MVP Build Order
A numbered list of 8–12 steps. Each step is ONE LINE: **Step N: [Name]** — [one sentence describing what it builds].
No sub-bullets, no prompts, no extra detail. Overview only.

## Success Metrics
Markdown table with columns: Metric | Target | How to Measure.
5–7 metrics that define whether the MVP is working.

Rules:
1. Tech stack, third-party services, MVP features → phrase as recommendations ("recommended: X — confirm before building")
2. SQL schemas, file structure, CRUD patterns, build step order → state as fact
3. Every section must be present. Do not skip any.
4. Be concise but complete. No filler.`

    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    console.log('[generate-prd] calling Anthropic generateText')
    let prdText: string
    try {
      const result = await generateText({
        model: anthropic('claude-haiku-4-5-20251001'),
        messages: [{ role: 'user', content: prompt }],
        maxOutputTokens: 2500,
      })
      prdText = result.text
      console.log('[generate-prd] generateText succeeded, prdText length:', prdText.length)
    } catch (err) {
      console.error('[generate-prd] Anthropic API call failed:', err)
      return NextResponse.json(
        { error: 'PRD generation failed — check server logs' },
        { status: 500 }
      )
    }

    console.log('[generate-prd] running checkDomainRisk')
    const { flagged, categories } = checkDomainRisk(prdText)
    console.log('[generate-prd] domain risk result:', { flagged, categories })

    // Parse into sections
    const parsedSections = parsePrdIntoSections(prdText)
    console.log('[generate-prd] parsed', parsedSections.length, 'sections')

    // Prepend domain risk banner to section 1 if flagged
    if (flagged && parsedSections.length > 0) {
      const banner = `> ⚠️ **Domain risk detected** — this PRD touches sensitive categories: **${categories.join(', ')}**. Review carefully before building. Some features may require legal, compliance, or security review.\n\n`
      parsedSections[0].content = banner + parsedSections[0].content
    }

    const title = deriveTitle(ideaDescription)
    console.log('[generate-prd] derived title:', title)

    console.log('[generate-prd] inserting buildProjects row')
    const [project] = await db.insert(buildProjects).values({
      userId,
      title,
      path: 'from_scratch',
      buildTool,
      status: 'reviewing_sections',
      prdMarkdown: null,
      domainRiskFlagged: flagged,
      domainRiskAcknowledged: false,
    }).returning()
    console.log('[generate-prd] buildProjects insert done, project.id:', project?.id)

    if (parsedSections.length > 0) {
      console.log('[generate-prd] inserting', parsedSections.length, 'prd_sections rows')
      await db.insert(prdSections).values(
        parsedSections.map((s, i) => ({
          projectId: project.id,
          sectionNumber: i + 1,
          sectionName: s.name,
          contentMarkdown: s.content,
        }))
      )
      console.log('[generate-prd] prd_sections insert done')
    }

    console.log('[generate-prd] inserting generationLogs row')
    await db.insert(generationLogs).values({
      projectId: project.id,
      generationType: 'prd',
      inputPayload: { ideaDescription, targetUser, coreFeature, buildTool },
      outputText: prdText,
      domainRiskFlagged: flagged,
      domainRiskCategories: categories.length > 0 ? categories : null,
    })
    console.log('[generate-prd] generationLogs insert done')

    return NextResponse.json({ projectId: project.id })
  } catch (err) {
    console.error('[generate-prd] full handler error:', err)
    console.error('[generate-prd] error stack:', err instanceof Error ? err.stack : '(no stack)')
    return NextResponse.json(
      { error: `Handler failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }
}
