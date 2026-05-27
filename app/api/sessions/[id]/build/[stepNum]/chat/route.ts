export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; stepNum: string }> }
) {
  const { id, stepNum } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    message,
    history = [] as ChatMessage[],
    stepTitle,
    stepInstructions,
    imageBase64,
    imageMimeType = 'image/png',
  } = body

  if (!message && !imageBase64) {
    return NextResponse.json({ error: 'message or image required' }, { status: 400 })
  }

  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  // Build the latest user message — include image if provided
  // Reconstruct full conversation for Claude
  const messages = [
    ...history.map((m: ChatMessage) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    // Latest user message — include image if provided
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
    model: anthropic('claude-sonnet-4-5'),
    system: `You are a helpful coding assistant inside an AI-powered build tool. The user is currently working on this build step:

Step: "${stepTitle}"
Instructions: "${stepInstructions}"

Help them debug errors, answer questions, and get unstuck. If they share a screenshot, analyse it carefully. Be concise and practical — 2-4 sentences unless a longer answer is genuinely needed. Format code with backticks.`,
    messages,
    maxOutputTokens: 1000,
  })

  return result.toTextStreamResponse()
}
