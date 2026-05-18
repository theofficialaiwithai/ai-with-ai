import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core'

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
