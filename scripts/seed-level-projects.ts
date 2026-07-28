import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const PLACEHOLDER_STEPS = [
  {
    step_number: 1,
    step_name: 'Placeholder Step',
    prompt_text: 'This is a placeholder — real step content for this level is coming soon.',
    verify_checklist: ['Placeholder check'],
  },
]

async function seed() {
  console.log('Clearing existing level_project_templates...')
  await db.delete(schema.levelProjectTemplates)

  console.log('Seeding level_project_templates (2 per level, levels 0-10)...')

  for (let levelNumber = 0; levelNumber <= 10; levelNumber++) {
    for (let projectNumber = 1; projectNumber <= 2; projectNumber++) {
      await db.insert(schema.levelProjectTemplates).values({
        levelNumber,
        projectNumber,
        projectTitle: `Level ${levelNumber} Mini-Project ${projectNumber}`,
        projectDescription: `A short guided build to practice what Level ${levelNumber} is about. Real content coming soon.`,
        stepsJson: PLACEHOLDER_STEPS,
      })
      console.log(`  ✓ Level ${levelNumber} Mini-Project ${projectNumber}`)
    }
  }

  console.log('\nVerifying row count...')
  const rows = await db.select().from(schema.levelProjectTemplates)
  console.log(`  level_project_templates: ${rows.length} rows (expected 22)`)
  if (rows.length !== 22) throw new Error(`Expected 22 rows, got ${rows.length}`)

  console.log('\n✅ Seed complete.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
