export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/encrypt'
import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/* Anthropic model IDs */
const ANTHROPIC_MODELS = new Set([
  'claude-haiku-3-5',
  'claude-sonnet-4-5',
  'claude-opus-4-5',
])

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

  /* ── Resolve API key + model from user profile ── */
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) })

  const preferredModel = profile?.preferredModel ?? 'claude-sonnet-4-5'
  const isOpenAI = !ANTHROPIC_MODELS.has(preferredModel)

  // Decrypt user's stored key if present; fall back to master key
  let model
  if (isOpenAI && profile?.openaiApiKey) {
    const decrypted = decrypt(profile.openaiApiKey)
    if (decrypted) {
      model = createOpenAI({ apiKey: decrypted })(preferredModel)
    }
  }

  if (!model) {
    // Always fall back to Anthropic Sonnet with the master key
    const anthropicKey = (profile?.anthropicApiKey && decrypt(profile.anthropicApiKey))
      || process.env.ANTHROPIC_API_KEY!
    model = createAnthropic({ apiKey: anthropicKey })(
      ANTHROPIC_MODELS.has(preferredModel) ? preferredModel : 'claude-sonnet-4-5'
    )
  }

  /* ── Build message history ── */
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
    system: `You are a helpful coding assistant inside an AI-powered build tool. The user is currently working on this build step:

Step: "${stepTitle}"
Instructions: "${stepInstructions}"

Help them debug errors, answer questions, and get unstuck. If they share a screenshot, analyse it carefully. Be concise and practical — 2-4 sentences unless a longer answer is genuinely needed. Format code with backticks.`,
    messages,
    maxOutputTokens: 1000,
  })

  return result.toTextStreamResponse()
}
