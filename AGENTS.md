# AGENTS.md

Quick reference for coding agents working in this repository.

## Commands

- `pnpm run dev` - Run SvelteKit dev server + PocketBase (full stack)
- `pnpm run build` - Type check and build for production
- `pnpm run check` - Run svelte-check for type checking
- `pnpm run lint` - Run Prettier check + ESLint
- `pnpm run format` - Format code with Prettier
- `pnpm run typegen` - Generate TypeScript types from PocketBase schema

**Note:** No test suite configured. Validate changes manually via `pnpm run dev`.

## Code Style

- **TypeScript:** Strict mode enabled. All code must be fully typed.
- **Svelte 5:** Use runes (`$state`, `$derived`, `$effect`) not legacy reactivity.
- **Imports:** Use `$lib/` alias for src/lib imports. Import types with `type` keyword.
- **Formatting:** Prettier + Tailwind plugin handles formatting. Use Tailwind utility classes.
- **Naming:** camelCase for variables/functions, PascalCase for components/types.
- **Error handling:** Catch errors, log to console, display user-friendly messages.
- **PocketBase:** Use typed client from `$lib/pocketbase` with generated types from `pocketbase-typegen.ts`.
