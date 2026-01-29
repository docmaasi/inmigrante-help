# CLAUDE.md — FamilyCare Help

## Core Philosophy

### Industry-Standard First

- **Always use the industry-standard approach** — choose the most widely adopted, battle-tested pattern for every problem. If React, Supabase, TanStack Query, or any tool in the stack already provides built-in functionality, use it instead of building a custom implementation.
- **Leverage the existing stack** — before writing custom code, check whether the frameworks and libraries already in the project solve the problem. Custom implementations should be a last resort, not a first instinct.
- **No reinventing the wheel** — if a well-maintained library or built-in feature exists for the task, use it. Only build from scratch when no standard solution fits.

### Take Your Time

- **There is never a rush.** Take the time to fully understand the problem, explore the codebase, and design the right solution before writing any code.
- **Thoroughness over speed** — read all relevant files, trace through the logic, and think through edge cases. A correct solution done carefully is always better than a fast one done carelessly.
- **Measure twice, cut once** — double-check your approach, verify assumptions, and make sure the solution is right before committing to it.

---

## About the Team

The people working in this repo are **not software engineers**. We are founders and product owners who have never written code manually. All code is generated via AI tooling ("vibecoding"). We are actively learning best practices and want to understand what's happening at a high level. This means:

- **Explain what you're doing and why** — before making major changes (new files, architecture shifts, adding dependencies, deleting features), briefly explain the approach in plain English and get confirmation
- For small, routine changes (bug fixes, lint fixes, typo corrections), just do them
- When introducing a pattern or concept for the first time, give a short plain-English explanation of **what it is** and **why it matters** — think of it as teaching us as you go
- Never use jargon without explanation
- Provide complete, working implementations — never partial snippets or TODOs
- Handle debugging and error resolution autonomously — but if something is fundamentally broken or ambiguous, ask before guessing

### Working Style

- **Always enter plan mode** when discussing or starting a new feature. Explore the codebase, design the approach, and get approval before writing code.
- **Always use sub-agents** (Task tool) when possible to save context window space.
  - Use **haiku** model for exploration, search, and read-only tasks (cheap and fast).
  - Use **opus** model for risky changes, complex logic, or anything that touches auth, data, or payments.
  - Use **sonnet** (default) for standard implementation work.

---

## Project Overview

**FamilyCare Help** is a monorepo with two apps and shared packages:

```
apps/
  dashboard/   → Main user-facing app (Vite + React)
  marketing/   → Marketing site (Vite + React)
packages/
  config/      → Shared configuration (ESLint, Tailwind, TypeScript)
  shared/      → Shared utilities and types
  ui/          → Shared React UI components
```

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Framework      | React 18 + TypeScript             |
| Build          | Vite 6 + Turborepo                |
| Backend        | Supabase (BaaS)                   |
| Auth           | Supabase Auth                     |
| Styling        | Tailwind CSS 3                    |
| UI Components  | Radix UI + shadcn/ui patterns     |
| Forms          | React Hook Form + Zod             |
| Data Fetching  | TanStack React Query + Supabase   |
| Routing        | React Router DOM v6               |
| Package Manager| pnpm 9                            |
| Linting        | ESLint (flat config)              |

---

## NAS Supabase (Development Environment)

Supabase runs on a TrueNAS server, **not locally**. Never run `supabase start` locally.

### Network

- **Primary IP (Tailscale):** `100.115.5.94`
- **Local network fallback:** `192.168.86.37`

### Ports & URLs

| Service        | URL                                                          |
|----------------|--------------------------------------------------------------|
| API            | `http://100.115.5.94:54341`                                  |
| REST           | `http://100.115.5.94:54341/rest/v1`                          |
| GraphQL        | `http://100.115.5.94:54341/graphql/v1`                       |
| Edge Functions | `http://100.115.5.94:54341/functions/v1`                     |
| Database       | `postgresql://postgres:postgres@100.115.5.94:54342/postgres` |
| Studio         | `http://100.115.5.94:54343`                                  |
| Mailpit        | `http://100.115.5.94:54344`                                  |

### Commands

```bash
# Start
ssh root@100.115.5.94 "cd /root/supabase-projects/familycare-help && /root/supabase start"

# Stop
ssh root@100.115.5.94 "cd /root/supabase-projects/familycare-help && /root/supabase stop"

# Status
ssh root@100.115.5.94 "cd /root/supabase-projects/familycare-help && /root/supabase status"

# Reset database
ssh root@100.115.5.94 "cd /root/supabase-projects/familycare-help && /root/supabase db reset"

# Sync migrations from Mac to NAS
rsync -avz --delete supabase/migrations/ root@100.115.5.94:/root/supabase-projects/familycare-help/supabase/migrations/
```

---

## Critical Rules

### Do NOT Build Unless Asked

Never run `pnpm build` or `turbo build` unless explicitly requested. Building is a deployment concern — not part of the normal development workflow.

### Never Run Supabase Locally

Never run `supabase start` or `npx supabase` on this machine. Supabase only runs on the NAS. Use the SSH commands above.

### Always Type Check After Changes

After making code changes, run:

```bash
pnpm typecheck
```

This runs `turbo typecheck` across the entire monorepo. Fix any type errors before considering the task done.

### Always Lint After Changes

After making code changes, run:

```bash
pnpm lint
```

Fix any lint errors before considering the task done.

### File Length Limits

- **Maximum 200 lines per file.** If a file exceeds this, split it into smaller, focused modules.
- **Maximum 30 lines per function.** Break larger functions into smaller helpers.
- When editing an existing file, check its length. If it's already over 200 lines, refactor as part of the change.

---

## Development Workflow

### Running Dev Servers

```bash
pnpm dev              # All apps
pnpm dev:marketing    # Marketing site only
pnpm dev:dashboard    # Dashboard app only
```

### Pre-commit & Pre-push Hooks (Husky)

This repo uses Husky git hooks:

- **Pre-commit**: Runs ESLint on staged files via lint-staged
- **Pre-push**: Runs full monorepo type check (`pnpm typecheck`)

These hooks enforce code quality automatically. Do not bypass them with `--no-verify`.

---

## Code Conventions

### TypeScript

- Use explicit return types on exported functions
- Prefer discriminated unions over optional properties
- Use Zod for validation at system boundaries
- Never use `any`, `@ts-ignore`, or non-null assertions (`!`)

### React

- Functional components only (no class components)
- Named exports only (no default exports)
- Colocate component files: `component-name.tsx` alongside `component-name.test.tsx`
- UI components handle presentation only — keep business logic in hooks/services

### Naming

- Files: `kebab-case.tsx`
- Components/Types: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Booleans: prefix with `is`, `has`, `should`, `can`

### Database (Supabase)

- Always enable Row-Level Security on tables
- Use timestamps (`created_at`, `updated_at`) on every table
- UUID primary keys with `gen_random_uuid()`
- Index foreign keys and frequently queried fields
- NOT NULL constraints unless truly optional

---

## Git Conventions

### Commit Messages (Conventional Commits)

```
<type>: <lowercase subject, max 70 chars>
```

Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore`, `ci`

### Branches

- `main` — production
- `feat/description` — features
- `fix/description` — bug fixes
