# CareerBridge: Release 1 foundation

Next.js 14 (App Router) + TypeScript + Tailwind + Prisma + **Neon Postgres**.

## Run locally
1. `npm install`
2. `cp .env.example .env` and paste your two Neon strings (pooled -> `DATABASE_URL`, direct -> `DIRECT_URL`)
3. `npm run db:push`  (creates tables)
4. `npm run db:seed`  (fictional companies and jobs)
5. `npm run dev`  -> http://localhost:3000

Check the code with `npm run typecheck` and `npm run lint`.

## What's included
- Responsive homepage, search hero, trust and match promises
- `/jobs`: keyword, location, work mode, type, verified, salary-disclosed filters, sorting, pagination (server-side, indexed)
- `/jobs/[id]`: explainable job fit (rule-based demo, try `?skills=React,AWS&exp=5`), job trust check, report button
- Blue/white design tokens in `tailwind.config.ts`, security headers, loading/empty/error/404 states

## Not built yet (next steps, in order)
Auth + roles, candidate profile/resume/applications, employer posting + verification, admin moderation, then AI, career tools, subscriptions.
Buttons for Apply / Save / Report are placeholders until auth exists.
