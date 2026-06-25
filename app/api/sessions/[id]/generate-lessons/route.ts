export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, messages, learnLessons } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { generateText } from 'ai'
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

  const plat = platformLabel(session.platform)

  const allMessages = await db.query.messages.findMany({
    where: eq(messages.sessionId, id),
    orderBy: [asc(messages.createdAt)],
  })

  const conversation = allMessages
    .filter(m => m.messageType === 'intake')
    .map(m => `${m.role === 'user' ? 'Learner' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  // Compact prompt — keep output under 3500 tokens to stay within 60s
  const userPrompt = `Platform: ${plat}

Intake:
${conversation}

Generate exactly 5 progressive lessons. Return ONLY a JSON array, no markdown, no fences.

Each lesson: {"lessonNumber":number,"title":string(max 35 chars),"conceptualFrame":string(60-80 words plain prose),"demonstrationExample":string(concrete example or short snippet),"microTask":string(one clear task),"microTaskType":"do"|"quiz","quizQuestions":null|[{"question":string,"options":["A","B","C","D"],"correctIndex":0-3,"explanation":string}],"resources":null|[{"title":string,"url":string,"type":"docs"|"video"|"example"}]}

Rules: quiz lessons include 3 questions. Alternate do/quiz starting with do. Start from learner's current level. resources: 1 real link or null.`

  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { text: raw } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    system: 'Return ONLY valid JSON array. No markdown, no explanation.',
    messages: [{ role: 'user', content: userPrompt }],
    maxOutputTokens: 3500,
  })

  const arrayStart = raw.indexOf('[')
  const arrayEnd = raw.lastIndexOf(']')
  if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
    console.error('generate-lessons: JSON extraction failed, raw length:', raw.length)
    return NextResponse.json({ error: 'Failed to parse lessons JSON' }, { status: 500 })
  }

  let lessons: Record<string, unknown>[]
  try {
    lessons = JSON.parse(raw.slice(arrayStart, arrayEnd + 1))
  } catch (e) {
    console.error('generate-lessons: JSON.parse failed:', e)
    return NextResponse.json({ error: 'Failed to parse lessons JSON' }, { status: 500 })
  }

  if (!Array.isArray(lessons) || lessons.length === 0) {
    return NextResponse.json({ error: 'Invalid lessons structure' }, { status: 500 })
  }

  await db.insert(learnLessons).values(
    lessons.map((lesson, index) => ({
      sessionId: id,
      lessonNumber: (lesson.lessonNumber as number) || index + 1,
      title: lesson.title as string,
      conceptualFrame: lesson.conceptualFrame as string,
      demonstrationExample: lesson.demonstrationExample as string,
      microTask: lesson.microTask as string,
      microTaskType: (lesson.microTaskType as string) || 'do',
      quizQuestions: Array.isArray(lesson.quizQuestions) ? lesson.quizQuestions : null,
      resources: Array.isArray(lesson.resources) ? lesson.resources : null,
      status: index === 0 ? 'active' : 'locked',
    }))
  )

  await db.update(sessions)
    .set({
      status: 'learning',
      totalSteps: lessons.length,
      currentStep: 1,
      lastActiveAt: new Date(),
    })
    .where(eq(sessions.id, id))

  return NextResponse.json({ redirectTo: `/sessions/${id}/learn/1` })
}
