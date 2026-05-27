import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, messages, buildPlans } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

// Extend the serverless function timeout — Claude can take up to ~60 s for
// a 4 000-token plan. Without this the Vercel default (10 s) kills it.
export const maxDuration = 60

const PRODUCT_SYSTEM = `You are a build plan generator. Based on the conversation above, generate a focused, build-ready PRD in clean Markdown. Include these sections:

## Product Name
One paragraph description of what it does and who it's for.

## Problem
One paragraph on the core problem it solves.

## Target User
One paragraph describing the primary user.

## MVP Features
3-5 specific features (not vague). Each as a ### subheading with 2-3 sentences.

## Tech Stack
A markdown table: Layer | Tool | Why
Use these defaults: Next.js 15 + Tailwind + shadcn/ui + Clerk + Neon + Drizzle + Vercel + Stripe (if payments needed) + Resend (if email needed)

## Data Schema
Drizzle ORM schema in a typescript code block (db/schema.ts format).

## App Routes
A markdown table: Route | Page | Description

## Build Order
Numbered list of 8-12 steps. Each step:
### Step N — [Title]
**What it builds:** one sentence
**Claude Code prompt:**
\`\`\`
[complete ready-to-paste prompt, self-contained, no placeholders]
\`\`\`
**Verify:**
- specific thing to check 1
- specific thing to check 2`

const WORKFLOW_SYSTEM = `Based on the conversation above, generate a workflow spec in clean Markdown:

## Workflow Name
One sentence description.

## Trigger
Exact app, event, and filter conditions.

## Steps
Numbered list. Each step: app name, action, exact fields to map, edge case notes.

## Data Flow
What data passes between each step.

## Test Case
How to verify the workflow end-to-end.`

function extractTitle(markdown: string): string {
  const match = markdown.match(/^##\s+(.+)$/m)
  return match?.[1]?.trim() ?? 'Build Plan'
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const existing = await db.query.messages.findMany({
    where: eq(messages.sessionId, id),
    orderBy: [asc(messages.createdAt)],
  })

  let conversation = existing.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // Claude requires the conversation to start with a user message
  if (conversation.length > 0 && conversation[0].role === 'assistant') {
    conversation = [{ role: 'user', content: 'Begin.' }, ...conversation]
  }

  // Claude requires the conversation to end with a user message
  if (conversation.length > 0 && conversation[conversation.length - 1].role === 'assistant') {
    conversation = [...conversation, { role: 'user', content: 'Generate the plan now based on everything we discussed.' }]
  }

  const systemPrompt = session.buildType === 'workflow' ? WORKFLOW_SYSTEM : PRODUCT_SYSTEM
  const planType = session.buildType === 'workflow' ? 'workflow_spec' : 'prd'

  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  /* ── Step 1: call Claude ── */
  console.log(
    '[generate-plan] calling Claude with', conversation.length, 'messages',
    '| first msg role:', conversation[0]?.role,
    '| first msg preview:', conversation[0]?.content?.slice(0, 100),
  )

  let planText: string
  try {
    // Use streamText so data flows continuously — prevents connection timeout
    // on long generations. We collect the full text before writing to DB.
    const result = streamText({
      model: anthropic('claude-sonnet-4-5'),
      system: systemPrompt,
      messages: conversation,
      maxOutputTokens: 4000,
    })
    planText = await result.text
    const finishReason = await result.finishReason
    const usage = await result.usage
    console.log(
      '[generate-plan] Claude response length:', planText?.length,
      '| finishReason:', finishReason,
      '| usage:', JSON.stringify(usage),
      '| first 200 chars:', planText?.slice(0, 200),
    )
  } catch (err) {
    console.error('[generate-plan] streamText ERROR for session', id, err)
    return NextResponse.json(
      { error: 'Claude API call failed', detail: String(err) },
      { status: 500 }
    )
  }

  if (!planText || planText.trim().length === 0) {
    console.error('[generate-plan] Claude returned empty text for session', id)
    return NextResponse.json({ error: 'Plan generation returned empty content' }, { status: 500 })
  }

  const title = extractTitle(planText)
  console.log(`[generate-plan] Generated ${planText.length} chars for session ${id}, title: "${title}"`)

  /* ── Step 2: save to DB ── */
  try {
    const existingPlan = await db.query.buildPlans.findFirst({
      where: eq(buildPlans.sessionId, id),
    })

    if (existingPlan) {
      await db.update(buildPlans)
        .set({ contentMarkdown: planText, title, approved: false, revisionCount: 0 })
        .where(eq(buildPlans.sessionId, id))
      console.log('[generate-plan] Updated existing plan row for session:', id, '| content length:', planText.length)
    } else {
      await db.insert(buildPlans).values({
        sessionId: id,
        planType,
        title,
        contentMarkdown: planText,
        approved: false,
      })
      console.log('[generate-plan] Inserted new plan row for session:', id, '| content length:', planText.length)
    }

    await db.update(sessions)
      .set({ status: 'plan_review', lastActiveAt: new Date() })
      .where(eq(sessions.id, id))
  } catch (err) {
    console.error('[generate-plan] DB ERROR for session', id, err)
    return NextResponse.json(
      { error: 'DB write failed', detail: String(err) },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, contentMarkdown: planText })
}
