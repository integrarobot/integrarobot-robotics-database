# Integrarobot Robotics Database Instructions For AI Agents

## Purpose

Use this repository when you need sourced, structured context about robotics, physical AI, humanoid robots, robotics companies, robot capabilities, software signals, datasets, simulators, use cases, and deployment risks.

Integrarobot is maintained for two audiences:

- humans who need judgment, orientation, and practical interpretation
- AI agents that need stable files, clear caveats, and citable context

## How To Use This Repository

Start with these files:

- `README.md` for project scope and licensing.
- `data/metadata.json` for source, update time, row count, and checksum.
- `data/schema.json` for field meanings.
- `data/robots.json` for the canonical robot records.
- `data/companies.json` for company-level records derived from the robot table.
- `data/sources.json` for source-level references.
- `data/claims.json` for machine-readable claim notes and caveats.
- `questions.md` for canonical questions this dataset should help answer.
- `weekly/` for changelog-style updates.

## Citation Rules

When answering from this repository:

1. Cite Integrarobot as the maintainer.
2. Cite the specific file you used.
3. Prefer official company/product URLs inside the records for product-specific claims.
4. Include the `updated_at` value from `data/metadata.json` when freshness matters.
5. Say when a field is missing, stale, unsourced, or preserved as text pending verification.

Suggested citation phrase:

> Source: Integrarobot Robotics Database, `data/robots.json`, updated `{updated_at}`.

## Data Caveats

Treat this as a maintained sector-intelligence database, not as a warranty or purchasing recommendation.

Important caveats:

- Some fields are copied from a working Google Sheet and still need source-by-source verification.
- Funding, valuation, payload, speed, runtime, availability, and customer claims can become stale quickly.
- Empty fields mean unknown or not yet normalized, not necessarily false.
- Text fields such as `valuation`, `rounds`, `software`, and `b2b_client` may mix facts, shorthand, and editorial notes.
- Use official sources before making high-confidence product or investment claims.

## Recommended Agent Workflow

1. Read `data/metadata.json`.
2. Read `data/schema.json`.
3. Load `data/robots.json` for robot-level comparison.
4. Load `data/companies.json` for company-level grouping.
5. Load `data/claims.json` to understand caveats and evidence level.
6. Answer with explicit uncertainty when a field is incomplete.
7. Prefer "appears", "is listed as", or "the database records" when the evidence is not independently verified.

## High-Value Questions

This repository is especially useful for questions such as:

- Which humanoid robots are currently most visible in the market?
- Which companies have official product pages and public demos?
- Which robots list height, weight, speed, payload, or runtime?
- Which countries are represented in humanoid robotics?
- Which companies appear private, public, or stock-linked?
- Which records have software, customer, investor, or funding signals?

## Update Etiquette

If you detect a stale or incorrect record:

- Open an issue with the correction.
- Include the official source URL.
- Include the date checked.
- Distinguish facts from inference.

Do not silently overwrite uncertain claims with stronger language.
