# ShotlistAI

Production-ready Next.js 14 app for AI-generated wedding photography shot lists, timelines, second shooter briefs, and client prep emails.

## Stack

- Next.js 14 App Router
- Tailwind CSS
- NVIDIA API (`meta/llama-3.3-70b-instruct`)
- Clerk Auth
- Supabase Postgres
- Dodo Payments checkout + customer portal
- Resend dependency ready for transactional email flows

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Dodo Payments
DODO_SECRET_KEY=
DODO_WEBHOOK_SECRET=
DODO_PRO_PRODUCT_ID=
DODO_STUDIO_PRODUCT_ID=

# Nvidia LLaMA
NVIDIA_API_KEY=

# Resend Email
RESEND_API_KEY=
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
- `/api/webhook`
