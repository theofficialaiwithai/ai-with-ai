# Generation Decision Rights

This document defines which parts of a generated PRD or agentic audit Claude states as **settled fact** versus which it phrases as **a recommendation requiring the user's explicit confirmation**.

> **One-line rule: When in doubt, phrase it as a recommendation, not a fact.**

---

## State as Settled Fact (no hedging)

These are deterministic, structural decisions that don't require the user to make a choice. Claude should state them directly and without qualification.

- **File and folder structure** — standard conventions for the chosen build tool (e.g. `src/`, `app/`, `components/`, `lib/`). There is no meaningful alternative the user needs to weigh.
- **Naming conventions** — camelCase for JS variables, snake_case for SQL columns, kebab-case for route segments. These are language/ecosystem standards, not preferences.
- **Standard CRUD implementation patterns** — create/read/update/delete endpoints follow well-established conventions and should be described directly. Phrasing them as "recommended" adds noise without adding clarity.
- **Numbered build order (sequence)** — the sequence of steps is a logical dependency graph derived from the feature set, not a preference the user needs to approve step-by-step.
- **Boilerplate and scaffolding** — `.gitignore`, `README.md` structure, environment variable naming, standard project layout.
- **SQL schema structure** — table names, primary keys, foreign key references, and standard constraint patterns follow from the data model and should be stated as fact.

---

## State as Recommendation (requires explicit user confirmation)

These involve trade-offs, external dependencies, cost, or lock-in. Claude must phrase them as recommendations and not decide on the user's behalf.

- **Tech stack choices that override the user's stated `build_tool` preference** — if a user chose Replit and the PRD suggests switching to a different runtime or framework, that must be flagged as a recommendation, not a fait accompli. The user's stated tool preference is authoritative.
- **MVP feature scope decisions** — which features make the cut for v1 is a product decision, not a technical one. Claude can propose a scope; the user confirms it.
- **Third-party integrations** — specific API vendors (Stripe, Resend, Clerk, Twilio, etc.) should always be flagged: `recommended: X — confirm before building`.
- **Hosting and deployment target** — e.g. `recommended: Vercel — confirm before building`. Cost and org policy may override.
- **Pricing and billing model** — subscription vs. one-time vs. freemium is a business decision the user owns.
- **Anything touching a domain-risk category** (from `lib/domain-risk.ts`) — if the PRD touches any of the following categories, every technical and architectural choice in that domain must be phrased as a recommendation, and a domain-risk banner must be surfaced to the user:
  - **payments** — payment flows, billing, checkout, invoicing, subscriptions, refunds, payouts
  - **auth** — authentication, sessions, credentials, OAuth, JWT, 2FA/MFA
  - **health** — medical data, patient records, clinical workflows, HIPAA-adjacent features
  - **pii** — personally identifiable information: SSN, date of birth, home address, passport, government ID, biometrics
  - **compliance** — HIPAA, GDPR, SOC 2, SOX, PCI, data residency requirements
  - **financial** — bank accounts, tax, loans, credit scoring, investment, trading, securities

  In these domains, Claude must not imply that any implementation choice is standard or obvious. The user or their legal/compliance team makes those calls.

---

## Why This Distinction Matters

Stating structural things as fact makes the PRD actionable — the user can start building immediately from the numbered steps without re-deciding what a component folder is called.

Flagging recommendations keeps the user in the decision seat for anything with cost, lock-in, regulatory exposure, or significant architectural consequence. The builder owns those choices; Claude informs them.

---

## Where This Is Enforced

The fact/recommendation split is enforced in the system prompt inside `app/api/build-ai/generate-prd/route.ts` (Rules 1 and 2 at the bottom of the prompt). The domain-risk banner is triggered by `lib/domain-risk.ts` and prepended to the first PRD section before the sections are persisted.

If you change the domain-risk categories in `lib/domain-risk.ts`, update the category list in this document to match.
