# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Always give one simple percentage for the certainty of an answer: eg. - 70%

## Commands

```bash
bun dev          # start dev server at http://localhost:3000
bun build        # production build
bun preview      # preview production build
bun lint         # ESLint
bun typecheck    # Vue/TypeScript type checking
```

## Architecture

Nuxt 4 app with Nuxt UI v4 (Tailwind CSS v4 + 125+ components auto-imported) and Supabase for the backend.

- `app/` — all application code (Nuxt 4 layout)
  - `app.vue` — root shell: `UApp > UMain > NuxtPage`
  - `pages/` — file-based routing
  - `components/` — auto-imported Vue components
  - `assets/css/main.css` — Tailwind + Nuxt UI imports; add `@theme` overrides here
  - `app.config.ts` — UI theme tokens (`primary`, `neutral` colors)
- `server/` — backend code (Nuxt 4 server routes)
- `nuxt.config.ts` — modules, runtime config, route rules

## Design
The design is clean and minimal. Always use a simple Nuxt UI component (e.g. `UButton`, `UCard`, `UInput`) when possible instead of custom HTML/CSS.

## Supabase

Credentials come from env vars exposed via `runtimeConfig.public`:

```
SUPABASE_URL=
SUPABASE_KEY=
```

Access in components/composables via `useRuntimeConfig().public.supabaseUrl` / `.supabaseKey`. The `@supabase/supabase-js` client must be instantiated manually (no Nuxt Supabase module).

## Style

Prettier is configured in `package.json`: single quotes, no semis, 2-space indent, trailing commas, 80-char print width. ESLint uses `@nuxt/eslint` with stylistic rules (no trailing comma in object/array literals — `commaDangle: 'never'` in the stylistic config, but `always-multiline` enforced in the custom ESLint rule override).
