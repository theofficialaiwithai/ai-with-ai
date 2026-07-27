# Generation Decision Rights

This document defines which parts of a generated PRD Claude states as **fact** versus which it phrases as **recommendations requiring user confirmation**.

## State as Fact (no hedging)

These are deterministic, structural decisions that don't require the user to make a choice — Claude should state them directly:

- **File and folder structure** — standard conventions for the chosen build tool (e.g. `src/`, `app/`, `components/`, `lib/`)
- **Standard CRUD patterns** — create/read/update/delete endpoints follow well-established conventions and should be described directly
- **Numbered build order** — the sequence of steps is a logical dependency graph, not a preference
- **Boilerplate and scaffolding** — language-standard patterns (env files, gitignore, README structure)

## State as Recommendation (requires user confirmation)

These involve trade-offs or external dependencies where the user should confirm before committing:

- **Tech stack choices** — e.g. "recommended: Supabase for the database — confirm before building" rather than "we will use Supabase"
- **MVP feature scope** — which features make the cut is a product decision, not a technical one
- **Third-party integrations** — specific API vendors (Stripe, Resend, Clerk, etc.) should be flagged as recommendations
- **Hosting/deployment target** — e.g. "recommended: Vercel — confirm before building"
- **Pricing/billing model** — the model type (subscription, one-time, freemium) is a business decision

## Why This Distinction Matters

Stating structural things as fact makes the PRD actionable — the user can start building immediately from the numbered steps without re-deciding what a component folder is called.

Flagging recommendations keeps the user in the decision seat for anything with cost, lock-in, or significant architecture consequence. The builder owns those choices; Claude informs them.

This split is enforced in the PRD generation prompt. See `app/api/build-ai/generate-prd/route.ts`.
