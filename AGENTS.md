# AGENTS.md

## This repo
Static marketing site for **Movial** (road safety / signaling, Barranquilla, Colombia). Pure HTML/CSS/JS — no `package.json`, no build step, no linter, no CI.

## Where to edit
- `public/index.html` — main page (`lang="es-CO"`, Spanish)
- `public/css/estilos.css` — stylesheet
- `public/js/sitio.js` — mobile menu, scroll reveal, lightbox
- `public/js/catalogo.js` — `CATALOGO` array (signal data) + catalog/cotización logic; signal images under `public/SEÑALES/<categoria>/`
- `public/servicios/<slug>/index.html` — 4 service sub-pages: `demarcacion-vial`, `estudios-transito-barranquilla`, `planes-manejo-transito`, `senalizacion-vial`
- `public/images/` — `.webp` images, lazy-loaded

## Verification / deploy
- No build step. Verify by opening `public/index.html` in a browser (desktop + mobile).
- **Tests (run before committing after touching HTML/CSS/JS):**
  - `node tests/validate.js` — validates IDs/classes referenced by JS, catalog structure (5 families, 232 items, unique IDs, images on disk), WhatsApp links, service sub-pages, and that `sitio.js` references resolve in HTML. Exit code 1 on failure.
  - Open `tests/runner.html` in the browser — functional suite for the catalog (counts per category, required fields, lazy images).
- `wrangler` is not installed locally. Install with `npm i -g wrangler` (or `npx wrangler`), then `wrangler deploy` publishes `./public` per `wrangler.json` (project `movial`, compatibility_date 2026-10-01).
- Gitignored scratch files safe to create/delete locally, never commit: `__dom.html`, `__diag.html`. Also ignored: `.agents/`, `~/`, `skills-lock.json`, `.wrangler/`, `node_modules/`.

## Impeccable skill (UI/design work)
- Installed at `.agents/skills/impeccable/` (v4.3.1, source `pbakaus/impeccable`, locked in `skills-lock.json`). Both `.agents/` and `skills-lock.json` are gitignored.
- For any UI task, run once per session from the repo root:
  - Windows (PowerShell/CMD, no `sh`): `.agents\skills\impeccable\scripts\impeccable.cmd context`
  - With `sh`: `.agents/skills/impeccable/scripts/impeccable context`
- Then load the relevant command reference (e.g. `critique`, `audit`, `polish`, `new-work`, `shape`) and follow it. `impeccable context` loads PRODUCT.md / DESIGN.md / surface briefs; do not rerun it in the same session.
- Hooks: `$impeccable hooks <on|off|status|ignore-rule|ignore-file|ignore-value|reset>` — auto-runs the design detector after UI edits.
- Doctor: `$impeccable doctor` — reports drift between Impeccable artifacts and the current skill version. Report `CONTEXT_STALE` findings; do not repair drift as a side effect of a design task unless marked `auto`.

## Site specifics
- WhatsApp lead: `+573138595695` (used in `wa.me` links across HTML/JS).
- Normative reference: Resolución 40595 de 2022 + Manual de Señalización Vial (in copy and Schema.org markup).
- Catalog counts shown in `index.html` (87 preventivas, 60 reglamentarias, 59 informativas, 22 dispositivos, 4 demarcación) must match `catalogo.js` if you change signal data.
- Commit style: Spanish, conventional-ish prefixes (`fix:`, `feat:`, `improveimprovement:`). Branch: `main`.
