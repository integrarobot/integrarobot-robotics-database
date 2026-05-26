# Agent-Facing Schema Notes

The canonical machine-readable field definitions live in `data/schema.json`.

This page explains how agents should interpret the first public export.

## Current Tables

- `data/robots.json`: robot-level records, currently derived from the `Humanoids` tab.
- `data/companies.json`: company-level records derived from `robots.json`.
- `data/sources.json`: source references for the export and known official URLs.
- `data/claims.json`: claim-level notes and caveats generated from the current records.

## Important Field Rules

- `id` is a stable lowercase identifier generated from company and robot.
- `company` is the company, lab, or organization associated with the robot.
- `robot` is the product, robot, or platform name.
- `website`, `x`, `linkedin`, and `youtube` are source or public-presence signals.
- `stock` may contain a ticker, public/private status, or shorthand.
- `rounds`, `valuation`, `investors`, and `b2b_client` are preserved as text and need source verification before strong claims.
- Numeric-looking fields such as `height_cm`, `weight_kg`, `walk_kmh`, `run_kmh`, `payload_kg`, and `power_hours` are strings because values can include ranges, notes, or blanks.

## Evidence Levels

Use these practical evidence labels:

- `official`: company website, official product page, official repository, official social account, or company documentation.
- `database`: value preserved from Integrarobot's working database.
- `derived`: generated from existing records, such as company grouping.
- `needs_verification`: useful signal, but should be checked before a high-confidence answer.

## Freshness

Always inspect `data/metadata.json`.

If the user asks for current availability, pricing, funding, partnerships, or product readiness, verify against current official sources before answering.
