# Emaye Degemign Delivery Co

A full-stack food delivery web app built with Next.js (App Router), Prisma, Supabase (Postgres + Auth), and Telegram bot login.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM
- Supabase (Postgres + Auth)
- Telegram Bot authentication

## Features

- Menu browsing + cart
- Checkout flow
- User profile + order history
- Admin orders dashboard

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

- `DATABASE_URL`, `DIRECT_DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SESSION_SECRET`

## Setup

```bash
npm install
npm run prisma:generate
npm run dev
```

## Production

```bash
npm run build
npm start
```
