# SoundShare

SoundShare is a Next.js app connected to Supabase/Postgres for music sharing, reactions, comments, moderation, and listening rooms.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Supabase (Postgres + Auth)
- Radix UI + Tailwind CSS

## Project Structure

- `app/`: pages and routes (view layer)
- `components/`: reusable UI components
- `hooks/`: reusable client hooks
- `mvc/models/`: domain types, Supabase client, DB mappers
- `mvc/controllers/`: app logic, auth logic, state controller
- `scripts/`: SQL schema/migrations/seed scripts

## Environment Variables

Create `.env.local` (you can copy from `.env.example`) and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Setup (Supabase SQL Editor)

Run scripts in this order for a fresh database:

1. `scripts/001_create_schema.sql`
2. `scripts/002_seed_data.sql`

If you are migrating an existing DB, run additionally:

1. `scripts/004_auth_user_genres_migration.sql`

Note: `scripts/003_create_tables.sql` is an alternative table-creation script; do not run it on top of an already initialized schema unless you know why.

## Run Locally

1. `npm install`
2. `npm run dev`

Open `http://localhost:3000`.

## Authentication

- Email/password auth is handled by Supabase Auth.
- Auth UI is available at `/auth`.
- Registration writes profile data into `public.users` and favorite genres into `public.user_favorite_genres`.

## Data Flow

- UI calls `useApp()` from `mvc/controllers/store.tsx`.
- `useApp()` is backed by `useAppController()` in `mvc/controllers/use-app-controller.ts`.
- Controller modules read/write Supabase through:
  - `mvc/models/supabase-client.ts`
  - `mvc/models/supabase-mappers.ts`
  - `mvc/models/types.ts`
