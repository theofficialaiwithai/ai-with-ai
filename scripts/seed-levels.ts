import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const LEVELS = [
  {
    levelNumber: 0,
    name: 'You type prompts and hope for the best',
    description: 'You type prompts and hope for the best',
    checkpoints: [
      'Open Claude Code and run your first prompt in a real project (not just chat)',
      'Get one small thing built end-to-end, even if messy',
    ],
  },
  {
    levelNumber: 1,
    name: 'You have a CLAUDE.md file. You know /compact and /cost',
    description: 'You have a CLAUDE.md file. You know /compact and /cost',
    checkpoints: [
      'Create a CLAUDE.md file in a real project',
      'Use /compact or /cost at least once in a session',
    ],
  },
  {
    levelNumber: 2,
    name: 'You connected MCP servers. Slack, Notion, Drive pulling live data',
    description: 'You connected MCP servers. Slack, Notion, Drive pulling live data',
    checkpoints: [
      'Connect at least one MCP server to Claude Code',
      'Pull live data from that MCP connection into an actual task',
    ],
  },
  {
    levelNumber: 3,
    name: 'You built custom skills. Repeatable workflows. One command',
    description: 'You built custom skills. Repeatable workflows. One command',
    checkpoints: [
      'Create a custom skill with its own SKILL.md',
      'Invoke that skill on two different tasks',
    ],
  },
  {
    levelNumber: 4,
    name: 'You have memory files, patterns, examples. Context engineering',
    description: 'You have memory files, patterns, examples. Context engineering',
    checkpoints: [
      'Set up a persistent memory or context file beyond CLAUDE.md',
      'Confirm Claude actually used that context in a session',
    ],
  },
  {
    levelNumber: 5,
    name: 'Multi-phase skills. Subagents. Systems that chain together',
    description: 'Multi-phase skills. Subagents. Systems that chain together',
    checkpoints: [
      'Build a skill with more than one phase or step',
      'Use a subagent to delegate part of a task',
    ],
  },
  {
    levelNumber: 6,
    name: 'Headless mode. Scripts calling Claude Code. JSON piping',
    description: 'Headless mode. Scripts calling Claude Code. JSON piping',
    checkpoints: [
      'Run Claude Code in headless/non-interactive mode from a script',
      'Pipe structured JSON input or output through that script',
    ],
  },
  {
    levelNumber: 7,
    name: 'Playwright browser control. Screenshots, scraping, PDF generation',
    description: 'Playwright browser control. Screenshots, scraping, PDF generation',
    checkpoints: [
      'Use Claude Code to control a browser for a real task',
      'Generate a screenshot, scrape a page, or produce a PDF as agentic output',
    ],
  },
  {
    levelNumber: 8,
    name: 'Parallel sessions. Orchestrator + specialist agents',
    description: 'Parallel sessions. Orchestrator + specialist agents',
    checkpoints: [
      'Run two or more Claude Code sessions in parallel on related tasks',
      'Set up one session to orchestrate or hand off to another',
    ],
  },
  {
    levelNumber: 9,
    name: 'Cron jobs. Background agents running 24/7. Claude Code as infrastructure',
    description: 'Cron jobs. Background agents running 24/7. Claude Code as infrastructure',
    checkpoints: [
      'Set up a scheduled job that runs Claude Code without manual starting',
      'Let a background agent run unattended for at least 24 hours',
    ],
  },
  {
    levelNumber: 10,
    name: 'Autonomous loops. Agents that build agents. A handful of people on the planet',
    description: 'Autonomous loops. Agents that build agents. A handful of people on the planet',
    checkpoints: [
      'Build an agent or skill whose job is to create another agent or skill',
      'Run an autonomous loop with a safety mechanism (kill switch or approval gate) in place',
    ],
  },
]

const AUTOMATION_CONTROLS = [
  { automationName: 'weekly_digest', paused: false },
  { automationName: 'stalled_project_check', paused: false },
]

async function seed() {
  console.log('Clearing existing checkpoints...')
  await db.delete(schema.levelCheckpoints)

  console.log('Seeding levels...')

  for (const level of LEVELS) {
    // Upsert level row
    await db.insert(schema.levels)
      .values({
        levelNumber: level.levelNumber,
        name: level.name,
        description: level.description,
      })
      .onConflictDoUpdate({
        target: schema.levels.levelNumber,
        set: { name: level.name, description: level.description },
      })

    console.log(`  ✓ Level ${level.levelNumber}: ${level.name.slice(0, 50)}…`)

    // Insert checkpoints fresh (table was cleared above)
    for (let i = 0; i < level.checkpoints.length; i++) {
      await db.insert(schema.levelCheckpoints)
        .values({
          levelNumber: level.levelNumber,
          checkpointText: level.checkpoints[i],
          sortOrder: i + 1,
        })
    }
  }

  console.log('\nSeeding automation_controls...')
  for (const row of AUTOMATION_CONTROLS) {
    await db.insert(schema.automationControls)
      .values(row)
      .onConflictDoUpdate({
        target: schema.automationControls.automationName,
        set: { paused: row.paused },
      })
    console.log(`  ✓ ${row.automationName}`)
  }

  console.log('\nVerifying row counts...')
  const levelRows = await db.select().from(schema.levels)
  const checkpointRows = await db.select().from(schema.levelCheckpoints)
  const automationRows = await db.select().from(schema.automationControls)

  console.log(`  levels: ${levelRows.length} rows (expected 11)`)
  console.log(`  level_checkpoints: ${checkpointRows.length} rows (expected 22)`)
  console.log(`  automation_controls: ${automationRows.length} rows (expected 2)`)

  if (levelRows.length !== 11) throw new Error(`Expected 11 levels, got ${levelRows.length}`)
  if (checkpointRows.length !== 22) throw new Error(`Expected 22 checkpoints, got ${checkpointRows.length}`)
  if (automationRows.length !== 2) throw new Error(`Expected 2 automation controls, got ${automationRows.length}`)

  console.log('\n✅ Seed complete.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
