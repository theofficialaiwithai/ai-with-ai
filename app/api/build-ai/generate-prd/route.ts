export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { db } from '@/db'
import { buildProjects, generationLogs } from '@/db/schema'
import { checkDomainRisk } from '@/lib/domain-risk'

function deriveTitle(ideaDescription: string): string {
  const trimmed = ideaDescription.trim()
  const sentence = trimmed.split(/[.!?\n]/)[0].trim()
  return sentence.length > 60 ? sentence.slice(0, 57) + '…' : sentence
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ideaDescription, targetUser, coreFeature, buildTool } = await req.json()
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

  const prompt = `You are a senior product strategist helping an indie builder create a focused, actionable PRD.

The builder wants to build the following:
- Idea: ${ideaDescription}
- Target user: ${targetUser}
- Core feature: ${coreFeature}
- Build tool: ${toolLabel}

Generate a complete PRD in Markdown with these exact sections:

## Overview
One paragraph description of the product. Then three punchy taglines (bullet list).

## Problem
What problem does this solve? Be specific. One short paragraph.

## Target Users
- **Primary:** [who this is built for]
- **Secondary:** [who might also benefit]
- **Not the target:** [who this is not for — important for scope]

## Core Value Proposition
One crisp sentence: "[Product] helps [user] do [outcome] without [friction]."

## MVP Features
List 5–7 features. Each feature: bold name, one-sentence description. These are recommendations — state them as "recommended: X — confirm before building."

## Out of Scope (v1)
Bullet list of things explicitly NOT included in v1. Be ruthless.

## Tech Stack
A markdown table with columns: Layer | Recommended Choice | Notes. Cover: frontend, backend/API, database, auth, hosting, any key third-party services. Each choice should be phrased as "recommended: X — confirm before building." Tailor choices to ${toolLabel} conventions.

## Build Order
Numbered list of 8–12 build steps. Each step:
**Step N: [Step Name]**
What it builds: [one sentence]
Prompt to paste into ${toolLabel}:
\`\`\`
[A complete, copy-pasteable prompt the builder can paste directly into ${toolLabel} to build this step. Be specific about file names, folder structure, and expected output. State file/folder structure and standard CRUD patterns as fact — no hedging on these.]
\`\`\`

Important rules for this PRD:
1. Tech stack choices and MVP feature scope → phrase as recommendations ("recommended: X — confirm before building")
2. File/folder structure, CRUD patterns, build step sequence → state as fact, no hedging
3. Every build-step prompt must be self-contained and pasteable — include enough context that ${toolLabel} can act on it without reading the rest of the document
4. Keep the PRD tight. No filler. A builder should be able to start within 10 minutes of reading this.`

  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { text: prdText } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    messages: [{ role: 'user', content: prompt }],
    maxOutputTokens: 4000,
  })

  const { flagged, categories } = checkDomainRisk(prdText)

  // Prepend caution banner if risk domains detected
  const storedPrd = flagged
    ? `> ⚠️ **Domain risk detected** — this PRD touches sensitive categories: **${categories.join(', ')}**. Review carefully before building. Some features may require legal, compliance, or security review.\n\n${prdText}`
    : prdText

  const title = deriveTitle(ideaDescription)

  const [project] = await db.insert(buildProjects).values({
    userId,
    title,
    path: 'from_scratch',
    buildTool,
    status: 'prd_generated',
    prdMarkdown: storedPrd,
    domainRiskFlagged: flagged,
    domainRiskAcknowledged: false,
  }).returning()

  await db.insert(generationLogs).values({
    projectId: project.id,
    generationType: 'prd',
    inputPayload: { ideaDescription, targetUser, coreFeature, buildTool },
    outputText: prdText,
    domainRiskFlagged: flagged,
    domainRiskCategories: categories.length > 0 ? categories : null,
  })

  return NextResponse.json({ projectId: project.id })
}
