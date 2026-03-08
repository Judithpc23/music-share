# SoundShare

SoundShare is a Next.js app that consumes a NestJS backend API for music sharing, reactions, comments, moderation, and listening rooms.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- NestJS backend API
- Radix UI + Tailwind CSS

## Project Structure

- `app/`: pages and routes (view layer)
- `components/`: reusable UI components
- `hooks/`: reusable client hooks
- `utils/`: shared types and utility helpers
- `controllers/`: API clients, auth logic, app state controller
- `scripts/`: SQL schema/migrations/seed scripts

## Environment Variables

Create `.env.local` (you can copy from `.env.example`) and set:

- `NEXT_PUBLIC_API_URL`

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

You can create it from the example file:

```bash
# Linux / macOS
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

## Database Setup (Supabase SQL Editor)

Run scripts in this order for a fresh database:

1. `scripts/001_create_schema.sql`
2. `scripts/002_seed_data.sql`

If you are migrating an existing DB, run additionally:

1. `scripts/004_auth_user_genres_migration.sql`

Note: `scripts/003_create_tables.sql` is an alternative table-creation script; do not run it on top of an already initialized schema unless you know why.

## Run Locally

1. Start the backend first (`Back-End/`), by default on `http://localhost:3000`.
2. Install frontend dependencies:
   - `npm install`
3. Run frontend on a different port (recommended `3001`):
   - `npm run dev -- -p 3001`

Open `http://localhost:3001`.

Note:
- Backend and frontend cannot both run on port `3000`.

## Authentication

- Email/password auth is handled through backend auth endpoints.
- Auth UI is available at `/auth`.
- Registration writes profile data through backend endpoints.

## Data Flow

- UI calls `useApp()` from `controllers/store.tsx`.
- `useApp()` is backed by `useAppController()` in `controllers/use-app-controller.ts`.
- Controller modules read/write through:
  - `controllers/api-client.ts`
  - `utils/types.ts`
