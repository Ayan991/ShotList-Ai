# ShotlistAI

ShotlistAI is an MVP SaaS app for wedding photographers. It generates a shot list, day timeline, second shooter brief, client prep email, gear checklist, and day-of risk plan from a short wedding brief.

## Free AI Provider

This version uses the Google Gemini API through a server-side Next.js route. That keeps the API key out of the browser.

1. Create a free API key in Google AI Studio.
2. Copy `.env.example` to `.env.local`.
3. Set `GEMINI_API_KEY`.
4. Run `npm run dev`.

The default model is `gemini-3.1-flash-lite`, which is intended for low-cost/high-volume use and currently has free-tier input/output tokens. You can change it with `GEMINI_MODEL`.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Current MVP Scope

- Wedding brief form
- Gemini-backed generation endpoint at `/api/generate`
- Saved weddings in browser local storage
- Copy active output
- Download JSON
- Print-friendly output
- Sample output mode for testing without an API key

## Next SaaS Steps

- Add Supabase Auth and database persistence
- Add per-user rate limits and monthly usage caps
- Add PDF export
- Add Stripe only after there are users asking to pay
