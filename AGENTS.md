# AI Agent Guide for Off The Blvd Coffee

## What this repository is

- Static marketing website for a coffee business.
- Main page is `index.html` with inline JavaScript and dynamic content loaded from `content/*.json`.
- Admin UI is configured in `admin/config.yml` for Decap CMS / Netlify CMS-style editing.
- Serverless backend is limited to Cloudflare Pages Functions in `functions/api/quote.js`.
- There is no `package.json`, build system, or automated tests in this repo.

## Key files and patterns

- `index.html`
  - Contains responsive layout, inline scripting, and client-side rendering for events, menu, about, gallery.
  - Fetches JSON from `content/events.json`, `content/about.json`, `content/menu.json`, and `content/gallery.json`.
  - Handles quote form submission via `/api/quote`.

- `content/*.json`
  - Source data for rendered page sections.
  - Editing these files changes content without modifying core HTML/JS.

- `functions/api/quote.js`
  - Cloudflare Pages function that validates form data, applies a honeypot anti-bot check, and sends email via the `cloudflare:email` binding.
  - Uses `env.SEND_EMAIL`; if missing, the function returns a server error.

- `functions/quote.js`
  - Deprecated legacy function and should not be updated for active behavior.

- `admin/config.yml`
  - CMS collection definitions for events, about, menu, and gallery.

## Development and deployment notes

- Preview locally by opening `index.html` in a browser or using Live Server.
- No build command exists; any JS changes must work as plain browser code.
- Keep scripts compatible with CSP and inline HTML patterns used in the page.
- Do not introduce a client-side bundler or Node-only dependencies unless a proper build system is added.

## Convention guidance for the agent

- Preserve existing inline script / fallback patterns. The page is designed to render progressively from static HTML + JSON.
- Keep form submission behavior and `/thank-you.html` redirect logic intact unless explicitly improving the quote flow.
- Any content-related updates should prefer `content/*.json` and `admin/config.yml` over hardcoded HTML changes.
- Use only browser-compatible JS in `index.html` and small serverless function code in `functions/api/quote.js`.

## Notes on `llama`

- This repo currently has no Llama or LLM integration.
- If asked to add `llama` support, treat it as a new feature that likely belongs outside the existing static site structure.
- Avoid adding heavy local model runtime dependencies directly into this repo unless a clear backend or build plan is established.

## Helpful references in this workspace

- `README.txt` — describes site preview instructions and important content replacement tasks.
- `TODO.md` — lists current enhancements and verification tasks for this repository.
