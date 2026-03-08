# SoundShare Back-End (NestJS)

Backend API for SoundShare built with NestJS.

## Requirements

- Node.js 20+
- npm
- Supabase project (URL + service role key)

## Environment Variables

Create a `.env` file in `Back-End/`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

Notes:
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are required.
- `PORT` defaults to `3000` if omitted.
- `CORS_ORIGIN` is optional. If omitted, CORS is open (`origin: true`).

You can create it from the example file:

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

## Install

```bash
npm install
```

## Run

```bash
# dev (watch)
npm run start:dev

# normal
npm run start

# prod
npm run build
npm run start:prod
```

## API Base URL

This backend uses global prefix `api`, so endpoints are exposed as:

```text
http://localhost:3000/api
```

Examples:
- `GET /api/bootstrap`
- `POST /api/auth/sign-in`
- `GET /api/rooms`
- `GET /api/engagement/reports`

## Useful Scripts

```bash
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

## Troubleshooting

- If startup fails with missing Supabase env vars, verify:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
- If frontend cannot call API, verify:
  - backend is running
  - frontend points to `http://localhost:3000/api`
  - `CORS_ORIGIN` includes your frontend origin
