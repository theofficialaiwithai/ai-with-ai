import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { encrypt } from '@/lib/encrypt'
import { NextResponse } from 'next/server'

type Provider = 'anthropic' | 'openai'

const COLUMN_MAP: Record<Provider, 'anthropicApiKey' | 'openaiApiKey'> = {
  anthropic: 'anthropicApiKey',
  openai: 'openaiApiKey',
}

/* ── Save (encrypt + upsert) ── */
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { provider, apiKey } = await req.json()
  if (!provider || !COLUMN_MAP[provider as Provider]) {
    return NextResponse.json({ error: 'provider must be anthropic or openai' }, { status: 400 })
  }
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    return NextResponse.json({ error: 'apiKey is required' }, { status: 400 })
  }

  const column = COLUMN_MAP[provider as Provider]
  const encrypted = encrypt(apiKey.trim())

  await db.update(profiles)
    .set({ [column]: encrypted })
    .where(eq(profiles.id, userId))

  return NextResponse.json({ success: true })
}

/* ── Delete (set to null) ── */
export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { provider } = await req.json()
  if (!provider || !COLUMN_MAP[provider as Provider]) {
    return NextResponse.json({ error: 'provider must be anthropic or openai' }, { status: 400 })
  }

  const column = COLUMN_MAP[provider as Provider]

  await db.update(profiles)
    .set({ [column]: null })
    .where(eq(profiles.id, userId))

  return NextResponse.json({ success: true })
}
