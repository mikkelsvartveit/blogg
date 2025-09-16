# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit + PocketBase blog application. The architecture consists of:

- **Frontend**: SvelteKit app configured as a SPA (Single Page Application) using `@sveltejs/adapter-static`
- **Backend**: PocketBase provides database, authentication, and file storage
- **Deployment**: Docker-based deployment where the SvelteKit build is served through PocketBase's static file serving

## Development Commands

### Main Development

```bash
pnpm run dev          # Runs both SvelteKit dev server and PocketBase concurrently
pnpm run dev:sveltekit # Runs only SvelteKit dev server (with typegen)
pnpm run dev:pocketbase # Runs only PocketBase server
```

### Building and Checking

```bash
pnpm run build       # Runs check and builds for production
pnpm run check       # Type checking and Svelte validation
pnpm run check:watch # Type checking in watch mode
```

### Code Quality

```bash
pnpm run lint        # Runs Prettier check and ESLint
pnpm run format      # Formats code with Prettier
```

### Type Generation

```bash
pnpm run typegen     # Generates TypeScript types from PocketBase schema
```

## Architecture Details

### PocketBase Integration

- PocketBase client is configured in `src/lib/pocketbase.ts` with TypeScript types from auto-generated `src/lib/pocketbase-typegen.ts`
- Types are automatically generated from the PocketBase database schema using `pocketbase-typegen`
- The app is configured as SPA mode (no SSR) to work seamlessly with PocketBase authentication

### SvelteKit Configuration

- Uses `@sveltejs/adapter-static` with fallback routing for SPA behavior
- Configured with `ssr: false` and `prerender: false` in layout
- Uses trailing slashes for consistent routing

### Development Setup

- Requires PocketBase binary in `./pocketbase/pocketbase`
- PocketBase serves on port 8090, SvelteKit dev server on port 5173
- Database migrations and hooks are stored in `pocketbase/pb_migrations` and `pocketbase/pb_hooks`

### Deployment

- Production deployment uses Docker multi-stage build
- SvelteKit build output is placed in `/pb/pb_public` to be served by PocketBase
- PocketBase serves the entire application on port 8080
- Supports multiple architectures (amd64, arm64, armv7)
