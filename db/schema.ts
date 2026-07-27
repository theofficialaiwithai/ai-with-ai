import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  jsonb,
  serial,
  check,
  unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionStatus: text('subscription_status').notNull().default('free'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  totalSessionsCompleted: integer('total_sessions_completed').notNull().default(0),
  freeSessionUsed: boolean('free_session_used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // API keys (encrypted at rest)
  anthropicApiKey: text('anthropic_api_key'),
  openaiApiKey: text('openai_api_key'),
  // Model preference
  preferredModel: text('preferred_model').notNull().default('claude-sonnet-4-5'),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  mode: text('mode').notNull(),
  platform: text('platform').notNull(),
  buildType: text('build_type'),
  title: text('title'),
  status: text('status').notNull().default('onboarding'),
  currentStep: integer('current_step').notNull().default(0),
  totalSteps: integer('total_steps'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
})

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  screenshotUrl: text('screenshot_url'),
  messageType: text('message_type').notNull().default('chat'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const buildPlans = pgTable('build_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  planType: text('plan_type').notNull(),
  title: text('title').notNull(),
  contentMarkdown: text('content_markdown').notNull(),
  approved: boolean('approved').notNull().default(false),
  approvedAt: timestamp('approved_at'),
  revisionCount: integer('revision_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const buildSteps = pgTable('build_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  stepNumber: integer('step_number').notNull(),
  title: text('title').notNull(),
  whatItBuilds: text('what_it_builds').notNull(),
  promptToPaste: text('prompt_to_paste').notNull(),
  verificationChecklist: text('verification_checklist').array().notNull(),
  status: text('status').notNull().default('locked'),
  completedAt: timestamp('completed_at'),
})

export const learnLessons = pgTable('learn_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  lessonNumber: integer('lesson_number').notNull(),
  title: text('title').notNull(),
  conceptualFrame: text('conceptual_frame').notNull(),
  demonstrationExample: text('demonstration_example').notNull(),
  microTask: text('micro_task').notNull(),
  microTaskType: text('micro_task_type').notNull().default('do'),
  quizQuestions: jsonb('quiz_questions'),
  resources: jsonb('resources'),
  status: text('status').notNull().default('locked'),
  microtaskCompletedAt: timestamp('microtask_completed_at'),
  quizScore: integer('quiz_score'),
  completedAt: timestamp('completed_at'),
})

// ── Build Projects (AI-with-AI builder flow) ──────────────────────────────

export const buildProjects = pgTable('build_projects', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  path: text('path').notNull(),
  buildTool: text('build_tool').notNull().default('claude_code'),
  status: text('status').notNull().default('discovery'),
  prdMarkdown: text('prd_markdown'),
  domainRiskFlagged: boolean('domain_risk_flagged').notNull().default(false),
  domainRiskAcknowledged: boolean('domain_risk_acknowledged').notNull().default(false),
  existingAppUrl: text('existing_app_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  check('build_projects_path_check', sql`${table.path} IN ('from_scratch','agentify_existing')`),
])

// SQL name 'project_steps' — 'build_steps' is already taken by the session-based table above
export const projectSteps = pgTable('project_steps', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => buildProjects.id)
    .notNull(),
  stepNumber: integer('step_number').notNull(),
  stepName: text('step_name').notNull(),
  promptText: text('prompt_text').notNull(),
  verifyChecklist: jsonb('verify_checklist').notNull(),
  isComplete: boolean('is_complete').default(false),
  completedAt: timestamp('completed_at'),
})

export const agenticAudits = pgTable('agentic_audits', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => buildProjects.id)
    .notNull(),
  dimension: text('dimension').notNull(),
  status: text('status').notNull(),
  notes: text('notes'),
}, (table) => [
  check('agentic_audits_dimension_check', sql`${table.dimension} IN ('event_response','scheduled_automation','external_connectivity','ai_reasoning','notification_alerting')`),
  check('agentic_audits_status_check', sql`${table.status} IN ('covered','partial','missing')`),
])

// ── Levels + Checkpoints ──────────────────────────────────────────────────

export const levels = pgTable('levels', {
  levelNumber: integer('level_number').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
})

export const levelCheckpoints = pgTable('level_checkpoints', {
  id: serial('id').primaryKey(),
  levelNumber: integer('level_number')
    .references(() => levels.levelNumber)
    .notNull(),
  checkpointText: text('checkpoint_text').notNull(),
  sortOrder: integer('sort_order').notNull(),
})

export const userCheckpointProgress = pgTable('user_checkpoint_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  checkpointId: integer('checkpoint_id')
    .references(() => levelCheckpoints.id)
    .notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
}, (table) => [
  unique('user_checkpoint_unique').on(table.userId, table.checkpointId),
])

// ── Generation Logs ───────────────────────────────────────────────────────

export const generationLogs = pgTable('generation_logs', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => buildProjects.id)
    .notNull(),
  generationType: text('generation_type').notNull(),
  inputPayload: jsonb('input_payload').notNull(),
  outputText: text('output_text').notNull(),
  domainRiskFlagged: boolean('domain_risk_flagged').notNull().default(false),
  domainRiskCategories: text('domain_risk_categories').array(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  check('generation_logs_type_check', sql`${table.generationType} IN ('prd','audit')`),
])

export const prdSections = pgTable('prd_sections', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => buildProjects.id)
    .notNull(),
  sectionNumber: integer('section_number').notNull(),
  sectionName: text('section_name').notNull(),
  contentMarkdown: text('content_markdown').notNull(),
  isApproved: boolean('is_approved').notNull().default(false),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ── Automation Controls ───────────────────────────────────────────────────

export const automationControls = pgTable('automation_controls', {
  automationName: text('automation_name').primaryKey(),
  paused: boolean('paused').notNull().default(false),
  pausedAt: timestamp('paused_at'),
  pausedBy: text('paused_by'),
})

// ── Subscriptions ─────────────────────────────────────────────────────────

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status').notNull().default('inactive'),
  priceId: text('price_id'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  check('subscriptions_status_check', sql`${table.status} IN ('inactive','active','past_due','canceled')`),
])
