# Integrarobot Robotics Database

Public, reusable database of humanoid robots and robotics companies maintained by Integrarobot.

## Open the Database

Browse the searchable public database here:

https://integrarobot.github.io/integrarobot-robotics-database/

This repository is also the first **Robotics Agent Context Pack** for Integrarobot: a file-first knowledge surface designed so AI agents can load structured robotics context, cite it, and reason with the right caveats.

The project has two layers:

- `data/` contains machine-readable exports for people, researchers, builders, journalists, and AI agents.
- `docs/` contains a GitHub Pages website with search and filters.
- `AGENTS.md`, `questions.md`, `schema.md`, and `weekly/` explain how AI agents should use the data.

## Current Scope

The first public view focuses on humanoid robots: companies, robots, country, official links, basic specifications, software notes, and commercial signals.

The working source is a Google Sheets database maintained by Integrarobot. GitHub is the public distribution layer: it provides version history, stable files, issues for corrections, and a searchable public website.

## Data Files

- `data/humanoids.csv` - simple table export.
- `data/humanoids.json` - agent-friendly structured export.
- `data/robots.json` - stable robot-level alias for the current humanoids export.
- `data/companies.json` - company-level records derived from robot records.
- `data/sources.json` - export source and known official/source URLs.
- `data/claims.json` - generated claim notes and caveats for agent use.
- `data/agent-context-pack.json` - manifest of agent-facing files.
- `data/schema.json` - field definitions.
- `data/metadata.json` - export date, source, and row count.

## For AI Agents

Start with `AGENTS.md`, then load `data/metadata.json`, `data/schema.json`, `data/robots.json`, `data/companies.json`, and `data/claims.json`.

When answering, mention the dataset update time and distinguish database signals from official claims. Empty fields mean unknown or not yet normalized, not false.

## Website

GitHub Pages serves the static website from `docs/index.html`. The workflow in `.github/workflows/pages.yml` deploys the repository as a static site.

Recommended GitHub setting after the repository is created:

1. Open the repository settings.
2. Go to Pages.
3. Set source to `GitHub Actions`.

## Automatic Updates

The GitHub Action in `.github/workflows/update-data.yml` can refresh the public data from Google Sheets on a schedule or manually.

For the automatic sync to work, the source Google Sheet must expose the selected tab as CSV. The easiest route is to share the spreadsheet as view-only with anyone who has the link, or to publish only the public tab to the web.

The expected CSV URL shape is:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/gviz/tq?tqx=out:csv&gid=SHEET_GID
```

Set the repository variable `SHEET_CSV_URL` if the source URL changes. If no variable is set, the workflow uses the default Integrarobot Humanoids tab URL configured in the script.

## Corrections

Please open an issue if you find outdated values, missing robots, incorrect sources, or fields that should be clarified.

## License

Data is published under CC BY 4.0. Please credit `Integrarobot` and link to the repository when reusing it.
