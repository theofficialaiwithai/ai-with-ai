import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, buildPlans } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { changeRequest } = await req.json()
  if (!changeRequest?.trim()) {
    return NextResponse.json({ error: 'changeRequest is required' }, { status: 400 })
  }

  const plan = await db.query.buildPlans.findFirst({
    where: eq(buildPlans.sessionId, id),
  })
  if (!plan) {
    return NextResponse.json({ error: 'No plan found' }, { status: 404 })
  }

  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { text: updatedPlan } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    maxOutputTokens: 4000,
    system: `You are a plan revision assistant. Here is the current plan:\n\n${plan.contentMarkdown}\n\nThe user wants these changes: ${changeRequest.trim()}\n\nRewrite the complete updated plan incorporating their changes. Return the full plan in the same Markdown format. Do not add any preamble or explanation — return only the plan markdown.`,
    prompt: 'Revise the plan as requested.',
  })

  await db.update(buildPlans)
    .set({
      contentMarkdown: updatedPlan,
      revisionCount: sql`${buildPlans.revisionCount} + 1`,
    })
    .where(eq(buildPlans.sessionId, id))

  return NextResponse.json({ contentMarkdown: updatedPlan })
}
