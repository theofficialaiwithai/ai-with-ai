export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { db } from '@/db'
import { buildProjects, agenticAudits, generationLogs } from '@/db/schema'
import { checkDomainRisk } from '@/lib/domain-risk'

const DIMENSION_LABELS: Record<string, string> = {
  event_response: 'Event Response',
  scheduled_automation: 'Scheduled Automation',
  external_connectivity: 'External Connectivity',
  ai_reasoning: 'AI Reasoning',
  notification_alerting: 'Notification & Alerting',
}

const STATUS_ICONS: Record<string, string> = {
  covered: '✅',
  partial: '⚠️',
  missing: '❌',
}

const AuditSchema = z.object({
  dimensions: z.array(z.object({
    dimension: z.enum(['event_response', 'scheduled_automation', 'external_connectivity', 'ai_reasoning', 'notification_alerting']),
    status: z.enum(['covered', 'partial', 'missing']),
    notes: z.string().describe('One sentence assessment specific to this app'),
  })).length(5),
  enhancements: z.array(z.object({
    rank: z.number().int(),
    pattern: z.enum(['webhook', 'cron', 'MCP', 'automation', 'claude_api']),
    title: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    effort: z.enum(['high', 'medium', 'low']),
    description: z.string().describe('2-3 sentences describing the specific implementation for this app'),
  })).min(3).max(7),
})

type AuditOutput = z.infer<typeof AuditSchema>

function buildMarkdown(
  appDescription: string,
  stackDescription: string,
  manualTasksDescription: string,
  audit: AuditOutput,
): string {
  const dimensionRows = audit.dimensions
    .map(d => {
      const icon = STATUS_ICONS[d.status]
      const label = DIMENSION_LABELS[d.dimension]
      const statusLabel = d.status.charAt(0).toUpperCase() + d.status.slice(1)
      return `| ${label} | ${icon} ${statusLabel} | ${d.notes} |`
    })
    .join('\n')

  const enhancementBlocks = audit.enhancements
    .map(e => {
      const patternLabel = e.pattern === 'claude_api' ? 'Claude API' : e.pattern.charAt(0).toUpperCase() + e.pattern.slice(1)
      const impactLabel = e.impact.charAt(0).toUpperCase() + e.impact.slice(1)
      const effortLabel = e.effort.charAt(0).toUpperCase() + e.effort.slice(1)
      return `### ${e.rank}. ${e.title}\n**Pattern:** ${patternLabel} | **Impact:** ${impactLabel} | **Effort:** ${effortLabel}\n\n${e.description}`
    })
    .join('\n\n')

  return `## App Context

${appDescription}

**Stack:** ${stackDescription}

**Manual work today:** ${manualTasksDescription}

---

## Agentic Dimension Scores

| Dimension | Status | Assessment |
|---|---|---|
${dimensionRows}

---

## Recommended Enhancements

Ranked by impact-over-effort ratio. Each enhancement is specific to your app.

${enhancementBlocks}
`
}

function deriveTitle(appDescription: string): string {
  const trimmed = appDescription.trim()
  const sentence = trimmed.split(/[.!?\n]/)[0].trim()
  return sentence.length > 60 ? sentence.slice(0, 57) + '…' : sentence
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { appDescription, stackDescription, manualTasksDescription, existingAppUrl } = body
    if (!appDescription || !stackDescription || !manualTasksDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const appUrl: string | null = (typeof existingAppUrl === 'string' && existingAppUrl.trim()) ? existingAppUrl.trim() : null

    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const prompt = `You are an agentic capability advisor. Analyze this app and generate a structured agentic enhancement audit.

## App Being Analyzed
**Description:** ${appDescription}
**Current stack:** ${stackDescription}
**Things that feel manual today:** ${manualTasksDescription}${appUrl ? `\n**Live app URL (for reference only):** ${appUrl}` : ''}

## Your Task

Score each of the 5 agentic dimensions based on the current app as described:

1. **Event Response** (event_response) — Does the app automatically react to external triggers like webhooks, file changes, or API events — without a human initiating it?
2. **Scheduled Automation** (scheduled_automation) — Does the app run jobs on a schedule (cron, timers, periodic tasks) without manual triggering?
3. **External Connectivity** (external_connectivity) — Does the app connect to external tools and services programmatically — APIs, databases, third-party platforms — beyond basic HTTP calls?
4. **AI Reasoning** (ai_reasoning) — Does the app use LLM-based reasoning to make decisions, classify inputs, extract structure, or generate content?
5. **Notification & Alerting** (notification_alerting) — Does the app proactively notify users or downstream systems when something happens, without the user having to check?

Then propose 3–7 enhancements ranked by impact-over-effort (highest ratio first). Each enhancement must use one of these patterns:
- **webhook** — Add a webhook receiver to react to external events in real time
- **cron** — Add a scheduled job that runs on a timer
- **MCP** — Connect to an MCP server to give the app access to external tools
- **automation** — Build an end-to-end automated workflow that chains multiple steps
- **claude_api** — Add a Claude API call for reasoning, classification, extraction, or generation

Be specific to this app. Reference the actual stack, the actual manual tasks, and propose enhancements that would eliminate the most friction.`

    let audit: AuditOutput
    try {
      const result = await generateObject({
        model: anthropic('claude-sonnet-4-6'),
        schema: AuditSchema,
        prompt,
      })
      audit = result.object
    } catch (err) {
      console.error('[generate-audit] Anthropic call failed:', err)
      return NextResponse.json({ error: 'Audit generation failed — check server logs' }, { status: 500 })
    }

    const planText = buildMarkdown(appDescription, stackDescription, manualTasksDescription, audit)
    const { flagged, categories } = checkDomainRisk(planText)

    const domainRiskBanner = flagged
      ? `> ⚠️ **Domain risk detected** — this audit touches sensitive categories: **${categories.join(', ')}**. Review carefully before building.\n\n`
      : ''

    const storedPrd = domainRiskBanner + planText

    const title = deriveTitle(appDescription)

    const [project] = await db.insert(buildProjects).values({
      userId,
      title,
      path: 'agentify_existing',
      buildTool: 'claude_code',
      status: 'prd_generated',
      prdMarkdown: storedPrd,
      domainRiskFlagged: flagged,
      domainRiskAcknowledged: false,
      existingAppUrl: appUrl,
    }).returning()

    await db.insert(agenticAudits).values(
      audit.dimensions.map(d => ({
        projectId: project.id,
        dimension: d.dimension,
        status: d.status,
        notes: d.notes,
      }))
    )

    await db.insert(generationLogs).values({
      projectId: project.id,
      generationType: 'audit',
      inputPayload: { appDescription, stackDescription, manualTasksDescription },
      outputText: planText,
      domainRiskFlagged: flagged,
      domainRiskCategories: categories.length > 0 ? categories : null,
    })

    return NextResponse.json({ projectId: project.id })
  } catch (err) {
    console.error('[generate-audit] full handler error:', err)
    console.error('[generate-audit] stack:', err instanceof Error ? err.stack : '(no stack)')
    return NextResponse.json(
      { error: `Handler failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }
}
