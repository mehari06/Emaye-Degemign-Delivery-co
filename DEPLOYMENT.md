# Deployment (Vercel + Supabase + Telegram Bot)

## 0) Rotate secrets (important)

If you ever pasted your `TELEGRAM_BOT_TOKEN` or `TELEGRAM_SESSION_SECRET` in chat/logs, rotate them:

- Rotate `TELEGRAM_BOT_TOKEN` in BotFather (`/token`).
- Generate a new `TELEGRAM_SESSION_SECRET` (see below).

## 1) Vercel settings

Vercel → Project → Settings:

- Root Directory: `./`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `.next`

## 2) Required environment variables (Vercel)

Vercel → Project → Settings → Environment Variables (set for **Production** at minimum):

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`

### Telegram

- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` (without `@`)
- `TELEGRAM_BOT_TOKEN` (from BotFather)
- `TELEGRAM_SESSION_SECRET` (generate yourself)
- `APP_BASE_URL` (your deployed URL, e.g. `https://your-app.vercel.app`)
- `TELEGRAM_WEBHOOK_SECRET` (generate yourself)

### Admin access (pick at least one)

- `ADMIN_EMAILS` (comma-separated, e.g. `you@gmail.com`)
- `ADMIN_USER_IDS` (comma-separated Supabase UUIDs)
- `ADMIN_TELEGRAM_USERNAMES` (comma-separated, without `@`, e.g. `meha06`)
- `ADMIN_TELEGRAM_IDS` (comma-separated numeric Telegram ids)

## 3) Generate secrets (local)

### TELEGRAM_SESSION_SECRET

PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### TELEGRAM_WEBHOOK_SECRET

PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4) Set the Telegram webhook (local)

Replace:
- `<BOT_TOKEN>` with your BotFather token
- `<VERCEL_DOMAIN>` with your deployed domain (no trailing slash)
- `<WEBHOOK_SECRET>` with your generated `TELEGRAM_WEBHOOK_SECRET`

PowerShell:
```powershell
$BOT_TOKEN = "<BOT_TOKEN>"
$VERCEL_DOMAIN = "https://<VERCEL_DOMAIN>"
$WEBHOOK_SECRET = "<WEBHOOK_SECRET>"

Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" -ContentType "application/json" -Body (@{
  url = "$VERCEL_DOMAIN/api/telegram/webhook"
  secret_token = $WEBHOOK_SECRET
} | ConvertTo-Json)
```

## 5) Create production DB tables (once)

Run locally with production DB URLs in `.env`:
```bash
npm run prisma:push
```

## 6) Test the flow

1. On your site, click “Continue with Telegram” → it opens the bot.
2. In Telegram, tap `/start` → bot asks to share contact.
3. Share contact → bot sends a “continue” link.
4. Tap the link → you should be signed in and redirected to `/profile`.

## 7) Bot ordering (optional)

After sharing contact in Telegram, you can order without using the website:

- Tap “Browse menu” to pick a category and add items to your cart.
- Tap “My cart” → “Checkout (share location)” and share your delivery location.
- Tap “My orders” to check order status.

### Location sharing notes

- Telegram Desktop may not support location sharing. If so, paste a Google Maps link or coordinates like `9.0192, 38.7525` after tapping Checkout.
