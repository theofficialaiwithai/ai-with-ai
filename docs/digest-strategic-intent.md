# Digest Strategic Intent

This document defines what the weekly digest is for, what it must never be used for, and who owns decisions about what it summarizes.

---

## What the Digest Is For

The weekly digest exists for one purpose: **helping builders get unstuck**.

It surfaces, per user account:

- Projects that have stalled (no step completions in the past 7+ days)
- Recent progress across active builds (steps completed, levels advanced)
- A summary of where each active project currently sits in its build sequence

The intended reader is the builder themselves. The digest is a personal productivity signal, not a report to anyone else.

---

## What the Digest Must Never Be Used For

The digest is a mirror for the user, not a signal for the platform. It must never feed into:

- **Account status decisions** — free vs. paid tier, access gates, feature unlocks
- **Pricing or billing actions** — usage-based charges, upsell triggers, plan changes
- **Access decisions** — restricting or expanding what a user can do based on their activity level
- **Any punitive action against the user** — churn risk scoring, warning flags, account suspension criteria

If you find yourself reading digest data to make a decision *about* the user rather than *for* the user, stop. That use case requires its own explicit design and consent.

---

## Who Owns Changes to What It Summarizes

**Adamma** owns all decisions about what the digest surfaces and how it frames that information, until this product has additional named team members with a defined scope over this feature.

This means:

- Changes to which signals the digest includes (e.g. adding level progression, removing stall detection) require Adamma's approval before shipping.
- Changes to the digest's delivery mechanism (email timing, format, opt-out) also require Adamma's approval.
- Engineering changes that affect *how* the digest computes its signals — but not *what* it surfaces — can ship without approval, as long as the output is equivalent.

When this product grows a team, update this document with the new ownership structure before merging any digest-related changes.

---

## Code References

The digest generation logic lives in `app/api/build-ai/digest/` (or wherever the weekly job is implemented). Any change to that code should be reviewed against this document before merging.
