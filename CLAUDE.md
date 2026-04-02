# CLAUDE.md

Guidelines for working on this codebase with Claude or any AI assistant.

## Project Overview

`lucky-astro-seo` is an Astro integration that brings Next.js App Router-style `generateMetadata` to Astro. It is a single-package library — source lives at the repo root, not under `packages/`.

Key concepts:
- `defaultSeo()` — Astro integration configured in `astro.config.mjs`, embeds site defaults into a Vite virtual module at build time
- `virtual:lucky-astro-seo` — the virtual module that exposes `generateMetadata()` and `resolveMetadata()` to pages
- `<SEO />` — Astro component that renders all `<meta>` and `<link>` tags from a `ResolvedMetadata` object
- `mergeMetadata()` — the core inheritance engine (`src/merge.ts`) that merges parent defaults with page overrides

## Structure

```
src/
  types.ts              # All TypeScript types (Metadata, ResolvedMetadata, etc.)
  integration.ts        # defaultSeo() Astro integration + Vite virtual module
  merge.ts              # mergeMetadata() — core inheritance engine
  defaults.ts           # createDefaultMetadata() — all-null baseline
  resolve-*.ts          # Individual field resolvers (title, url, robots, etc.)
  index.ts              # Public package entry point
  virtual.d.ts          # Type declarations for virtual:lucky-astro-seo
  components/
    SEO.astro           # <SEO /> component
test/                   # Vitest test files, one per resolver
examples/
  with-lucky-astro-seo/ # Working Astro demo app
```

## Development

```bash
npm install       # installs deps and sets up the git pre-commit hook
npm run build     # compile with tsup
npm run dev       # watch mode
npm test          # run tests
npm run typecheck # TypeScript check without emitting
npm run lint      # oxlint
npm run lint:fix  # oxlint with auto-fix
npm run format    # oxfmt (formats in place)
npm run format:check  # oxfmt dry-run (used in CI)
```

## Code Style

Formatting is handled by **oxfmt** and linting by **oxlint**. Config lives in `.oxfmtrc.json` and `.oxlintrc.json`. A pre-commit hook runs `npm run lint` automatically on every commit — it is installed via `npm install` through the `prepare` script.

Key style rules: no semicolons, single quotes, 100 print width, trailing commas (ES5).

Do not configure formatting or linting manually — run `npm run format` and let oxfmt handle it.

## Testing

Tests live in `test/`, one file per resolver. We use **Vitest 2**.

- Run all tests: `npm test`
- Watch mode: `npm run test:watch`

**Bug fix rule: write a failing test that reproduces the bug first, confirm it fails, then apply the fix and confirm the test passes.** Do not fix a bug without a test.

## Adding a New Field

1. Add the input type to `Metadata` and the resolved type to `ResolvedMetadata` in `src/types.ts`
2. Add a resolver in `src/resolve-<field>.ts` with a corresponding test file
3. Wire it into `mergeMetadata()` in `src/merge.ts`
4. Render it in `src/components/SEO.astro`
5. Document it in `README.md` (field reference table + relevant pattern section)

## Virtual Module

The virtual module is implemented with a standard Vite plugin (`resolveId` + `load` hooks) inside `src/integration.ts`. Do **not** use `addVirtualImports` — it does not exist in Astro 5 core. The module code is generated as a string and serialized at config setup time.

## Publishing

The `files` array in `package.json` controls what gets published: `dist/`, `src/components/`, and `src/virtual.d.ts`. The `dist/` directory is gitignored — always run `npm run build` before publishing.
