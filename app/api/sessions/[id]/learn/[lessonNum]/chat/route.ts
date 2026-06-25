export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/encrypt'
import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; lessonNum: string }> }
) {
  const { id, lessonNum } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    message,
    history = [] as ChatMessage[],
    lessonTitle,
    lessonConcept,
    imageBase64,
    imageMimeType = 'image/png',
  } = body

  if (!message && !imageBase64) {
    return NextResponse.json({ error: 'message or image required' }, { status: 400 })
  }

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) })
  const anthropicKey =
    (profile?.anthropicApiKey && decrypt(profile.anthropicApiKey)) ||
    process.env.ANTHROPIC_API_KEY!

  const model = createAnthropic({ apiKey: anthropicKey })('claude-sonnet-4-5')

  const messages = [
    ...history.map((m: ChatMessage) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    ...(imageBase64
      ? [{
          role: 'user' as const,
          content: [
            ...(message ? [{ type: 'text' as const, text: message }] : []),
            { type: 'image' as const, image: imageBase64, mimeType: imageMimeType },
          ],
        }]
      : [{ role: 'user' as const, content: message as string }]),
  ]

  const result = streamText({
    model,
    system: `You are a helpful learning assistant inside an AI-powered learning tool. The learner is currently studying:

Lesson ${lessonNum}: "${lessonTitle}"
Concept: "${lessonConcept}"

Help them understand the concept, answer questions, and work through the micro-task. Be encouraging, clear, and concrete. Use examples when helpful. Keep answers focused — 2-4 sentences unless a detailed explanation is genuinely needed. Format code with backticks.`,
    messages,
    maxOutputTokens: 800,
  })

  return result.toTextStreamResponse()
}
