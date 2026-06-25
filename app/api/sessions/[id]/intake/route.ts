import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, messages } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

function platformLabel(p: string): string {
  const map: Record<string, string> = {
    'claude-code': 'Claude Code',
    codex: 'Codex',
    zapier: 'Zapier',
    make: 'Make',
  }
  return map[p] ?? p
}

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

  const { content } = await req.json()
  const isInit = content === '__init__'

  const plat = platformLabel(session.platform)
  const bt = session.buildType
  const isLearn = session.mode === 'learn'

  /* first message content and system prompt */
  const firstMsg = isLearn
    ? `Which ${plat} features are you already comfortable with, and what would you like to be able to build or automate by the end of this?`
    : bt === 'workflow'
    ? `Hey! Let's build your workflow automation on ${plat}. First question \u2014 what triggers this workflow? What event or action should kick it off?`
    : `Hey! Let's build your product on ${plat}. To kick things off \u2014 what does your product do, and who is it for?`

  const systemPrompt = isLearn
    ? `You are a learning path designer helping someone learn ${plat}. Your goal is to understand their current skill level and what they want to achieve so you can generate a tailored lesson plan. Ask at most 2 short follow-up questions \u2014 one at a time. Once you have a clear picture of their starting point and goals, say exactly: 'I have everything I need. Ready to generate your lesson plan?' Do not ask more questions after that.`
    : bt === 'workflow'
    ? `You are a co-building assistant helping someone build a workflow automation on ${plat}. Ask one question at a time. Do not ask more than 5 questions total. Gather: the trigger (what starts the workflow), the desired outcome, data transformations needed, any conditional logic. After 3-5 exchanges, say exactly: 'I have everything I need. Ready to generate your plan?' and wait for confirmation.`
    : `You are a co-building assistant helping someone build a product on ${plat}. Your job is to gather enough context to generate a solid build plan. Ask one question at a time. Do not ask more than 5 questions total. Gather: what the product does and who it's for, whether it needs auth/database/payments, any specific integrations, the user's experience level. After 3-5 exchanges when you have enough context, say exactly: 'I have everything I need. Ready to generate your plan?' and wait for confirmation.`

  /* ── INIT: stream predefined first question directly ── */
  if (isInit) {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const words = firstMsg.split(' ')
        for (let i = 0; i < words.length; i++) {
          const word = (i === 0 ? '' : ' ') + words[i]
          controller.enqueue(encoder.encode(word))
          await new Promise(r => setTimeout(r, 22))
        }

        // persist
        await db.insert(messages).values({
          sessionId: id,
          role: 'assistant',
          content: firstMsg,
          messageType: 'intake',
        }).catch(console.error)

        await db.update(sessions)
          .set({ lastActiveAt: new Date() })
          .where(eq(sessions.id, id))
          .catch(console.error)

        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  /* ── REGULAR: save user message, stream Claude response ── */
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  await db.insert(messages).values({
    sessionId: id,
    role: 'user',
    content,
    messageType: 'intake',
  })

  const existing = await db.query.messages.findMany({
    where: eq(messages.sessionId, id),
    orderBy: [asc(messages.createdAt)],
  })

  // Claude requires conversation to start with a user message
  let conversation = existing.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  if (conversation.length > 0 && conversation[0].role === 'assistant') {
    conversation = [{ role: 'user', content: 'Begin.' }, ...conversation]
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: systemPrompt,
    messages: conversation,
    async onFinish({ text }) {
      await db.insert(messages).values({
        sessionId: id,
        role: 'assistant',
        content: text,
        messageType: 'intake',
      })
      await db.update(sessions)
        .set({ lastActiveAt: new Date() })
        .where(eq(sessions.id, id))
    },
  })

  return result.toTextStreamResponse()
}
