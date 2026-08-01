import { db } from '@/db'
import { sql } from 'drizzle-orm'

async function main() {
  await db.execute(sql`
    ALTER TABLE project_steps
    ADD COLUMN IF NOT EXISTS checked_items jsonb NOT NULL DEFAULT '[]'::jsonb
  `)
  console.log('Migration complete: checked_items column added to project_steps')
}

main().catch(console.error)
