import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

const VALID_MODELS = [
  'claude-haiku-3-5',
  'claude-sonnet-4-5',
  'claude-opus-4-5',
  'gpt-4o-mini',
  'gpt-4o',
  'o1-mini',
]

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { model } = await req.json()
  if (!model || !VALID_MODELS.includes(model)) {
    return NextResponse.json({ error: 'Invalid model', valid: VALID_MODELS }, { status: 400 })
  }

  await db.update(profiles)
    .set({ preferredModel: model })
    .where(eq(profiles.id, userId))

  return NextResponse.json({ success: true })
}
