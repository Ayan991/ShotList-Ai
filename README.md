# ShotlistAI

Production-ready Next.js 14 app for AI-generated wedding photography shot lists, timelines, second shooter briefs, and client prep emails.

## Stack

- Next.js 14 App Router
- Tailwind CSS
- Anthropic Claude (`claude-sonnet-4-20250514`)
- Clerk Auth
- Supabase Postgres
- Dodo Payments checkout + customer portal
- Resend dependency ready for transactional email flows

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DODO_PRO_CHECKOUT_URL=
DODO_STUDIO_CHECKOUT_URL=
DODO_CUSTOMER_PORTAL_URL=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Database

Run `supabase/schema.sql` in your Supabase SQL editor. It creates:

- `public.users`
- `public.weddings`
- `public.usage`
- Clerk-linked user identity (`clerk_user_id`)

## Commands

```bash
npm install
npm run dev
npm run build
```

## Routes

- `/` landing page
- `/login`, `/signup`, `/forgot-password`
- `/dashboard`
- `/dashboard/saved`
- `/dashboard/account`
- `/api/generate`
- `/api/create-checkout`
- `/api/create-portal`
- `/api/webhook` (stubbed for Dodo integration)
