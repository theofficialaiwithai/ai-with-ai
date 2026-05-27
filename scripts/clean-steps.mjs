import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

// Parse .env.local manually (Next.js loads this, but plain Node doesn't)
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const sql = neon(process.env.DATABASE_URL)

// Show recent sessions
const sessions = await sql`
  SELECT id, status, total_steps, current_step, last_active_at
  FROM sessions
  ORDER BY last_active_at DESC
  LIMIT 5
`
console.log('\n=== Recent sessions ===')
for (const s of sessions) {
  console.log(`  ${s.id}  status=${s.status}  steps=${s.total_steps}  current=${s.current_step}  active=${s.last_active_at}`)
}

// Show build_steps counts per session
const counts = await sql`
  SELECT session_id, count(*)::int AS step_count
  FROM build_steps
  GROUP BY session_id
`
console.log('\n=== build_steps rows per session ===')
for (const c of counts) {
  console.log(`  ${c.session_id}  →  ${c.step_count} steps`)
}

// Delete build_steps for all sessions that have them (safe for dev)
if (counts.length > 0) {
  const deleted = await sql`DELETE FROM build_steps RETURNING session_id`
  console.log(`\n✓ Deleted ${deleted.length} build_steps rows`)

  // Reset sessions back to plan_review so Approve & Continue works again
  await sql`
    UPDATE sessions
    SET status = 'plan_review', current_step = 0, total_steps = NULL
    WHERE id IN (SELECT DISTINCT session_id FROM (SELECT unnest(ARRAY[${deleted.map(r => r.session_id).join("','")}]::uuid[]) AS session_id) t)
  `
  console.log('✓ Reset affected sessions to plan_review')
} else {
  console.log('\n(no build_steps rows to delete)')
}
