export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, buildPlans, buildSteps } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

interface RawStep {
  stepNumber: number
  title: string
  instructions: string
  verifyItems: string[]
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

  const plan = await db.query.buildPlans.findFirst({
    where: eq(buildPlans.sessionId, id),
  })
  if (!plan) {
    return NextResponse.json({ error: 'No plan found' }, { status: 404 })
  }

  // Mark plan as approved before we call Claude
  await db.update(buildPlans)
    .set({ approved: true, approvedAt: new Date() })
    .where(eq(buildPlans.sessionId, id))

  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  /* ── Step 1: extract steps via Claude ── */
  let steps: RawStep[]
  try {
    const { text: raw } = await generateText({
      model: anthropic('claude-sonnet-4-5'),
      maxOutputTokens: 8000,
      prompt: `Break the following build plan into exactly 10 focused build steps. Each step does ONE specific thing. Return a JSON array only — no markdown, no explanation, no code fences.

Each object in the array must have exactly these fields:
{
  "stepNumber": number,
  "title": string (max 40 chars),
  "instructions": string (40-60 words max — a tight Claude Code prompt for this one task only),
  "verifyItems": string[] (exactly 2 short, specific checks — one sentence each)
}

Build plan:
${plan.contentMarkdown}`,
    })

    // Log the full raw response for debugging
    console.log('[generate-steps] raw response length:', raw.length)
    console.log('[generate-steps] raw response START:', raw.slice(0, 300))
    console.log('[generate-steps] raw response END:', raw.slice(-200))

    // Extract the JSON array robustly: find the first '[' and last ']'
    // This handles any preamble text, code fences, or trailing commentary Claude adds
    const arrayStart = raw.indexOf('[')
    const arrayEnd = raw.lastIndexOf(']')

    if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
      console.error('[generate-steps] No JSON array found in response. Full response:', raw)
      return NextResponse.json(
        { error: 'Failed to parse steps JSON', detail: 'No JSON array found in Claude response', raw: raw.slice(0, 1000) },
        { status: 500 }
      )
    }

    const extracted = raw.slice(arrayStart, arrayEnd + 1)
    console.log('[generate-steps] extracted JSON (first 300 chars):', extracted.slice(0, 300))

    try {
      steps = JSON.parse(extracted)
    } catch (parseErr) {
      console.error('[generate-steps] JSON.parse failed:', String(parseErr))
      console.error('[generate-steps] attempted to parse:', extracted.slice(0, 500))
      return NextResponse.json(
        { error: 'Failed to parse steps JSON', detail: String(parseErr), raw: extracted.slice(0, 1000) },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('[generate-steps] generateText ERROR for session', id, err)
    return NextResponse.json(
      { error: 'Claude API call failed', detail: String(err) },
      { status: 500 }
    )
  }

  console.log('[generate-steps] Claude extracted', steps.length, 'steps for session:', id)

  /* ── Step 2: write steps to DB ── */
  try {
    // Remove stale steps (idempotent re-runs)
    await db.delete(buildSteps).where(eq(buildSteps.sessionId, id))

    // Insert all steps in parallel
    await Promise.all(
      steps.map(step =>
        db.insert(buildSteps).values({
          sessionId: id,
          stepNumber: step.stepNumber,
          title: step.title,
          whatItBuilds: step.instructions,
          promptToPaste: step.instructions,
          verificationChecklist: Array.isArray(step.verifyItems) ? step.verifyItems : [],
          status: step.stepNumber === 1 ? 'active' : 'locked',
        })
      )
    )

    await db.update(sessions)
      .set({
        status: 'building',
        totalSteps: steps.length,
        currentStep: 1,
        lastActiveAt: new Date(),
      })
      .where(eq(sessions.id, id))

    console.log('[generate-steps] Inserted', steps.length, 'steps for session:', id)
  } catch (err) {
    console.error('[generate-steps] DB ERROR for session', id, err)
    return NextResponse.json(
      { error: 'DB write failed', detail: String(err) },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, stepCount: steps.length })
}
