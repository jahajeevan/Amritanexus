# Amrita Nexus — Deployment Guide

Stack: **Vite + React + Tailwind** frontend, **Vercel serverless functions** (`/api`) for
email OTP + admin verification, **Supabase** (optional) for cross-device student accounts,
**Gmail SMTP** for one-time-passcode emails.

---

## 1. GitHub

Code lives at **https://github.com/jahajeevan/Amritanexus** (branch `main`).

```bash
git add -A
git commit -m "your message"
git push
```

`.env` is git-ignored — secrets never get committed. Only `.env.example` (placeholders) is in the repo.

---

## 2. Vercel

1. Go to https://vercel.com/new and **Import** the `jahajeevan/Amritanexus` repo.
2. Framework preset is auto-detected as **Vite** (build `vite build`, output `dist`). `vercel.json` is already configured.
3. Add the **Environment Variables** below (Project → Settings → Environment Variables), then **Deploy**.
4. Every push to `main` re-deploys automatically.

### Environment variables

| Name | Scope | Purpose |
|------|-------|---------|
| `VITE_SUPABASE_URL` | Public (browser) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public (browser) | Supabase publishable key (safe to expose) |
| `VITE_ADMIN_EMAIL` | Public (browser) | Admin login email (offline fallback) |
| `VITE_ADMIN_PASSWORD_HASH` | Public (browser) | SHA-256 of admin password (never the plaintext) |
| `GMAIL_USER` | **Server only** | Gmail address that sends OTP emails |
| `GMAIL_APP_PASSWORD` | **Server only** | Gmail App Password (16 chars) |
| `OTP_SECRET` | **Server only** | Random string that signs OTP tokens |
| `ADMIN_EMAIL` | **Server only** | Admin email for server-side check |
| `ADMIN_PASSWORD` | **Server only** | Admin plaintext password (server-side check) |

> The exact values for this project are in your local `.env` file. Copy them into Vercel.
> **Never** prefix the server-only vars with `VITE_` — that would leak them into the browser bundle.

To regenerate the admin password hash after a password change:
```bash
printf '%s' 'NewPassword' | shasum -a 256
```

---

## 3. Supabase (optional but recommended)

1. Open your project → **SQL Editor** → paste and run [`supabase/schema.sql`](supabase/schema.sql).
2. That creates the `students` table with Row-Level Security (sign-up allowed for
   `@cb.students.amrita.edu` emails; password hashes are **not** publicly readable).
3. The app auto-detects Supabase from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
   If Supabase is unreachable, everything still works via `localStorage`.

---

## 4. Gmail App Password (for OTP email)

The OTP emails are sent from your Gmail via SMTP. You need an **App Password**
(not your normal password):

1. Enable 2-Step Verification on the Google account.
2. https://myaccount.google.com/apppasswords → create one → paste into `GMAIL_APP_PASSWORD`.

---

## 5. Admin login

- Tab **Admin** on the sign-in page.
- Email: `jjv25021@gmail.com` · Password: the one you set (verified server-side via
  `/api/admin-login`, with a hashed offline fallback baked into the client).

## 6. Student sign-up rule

Students can only register with an official **`@cb.students.amrita.edu`** email. This is
enforced in the UI, in the `/api/send-otp` endpoint, and in the account layer.

---

## Local development

```bash
npm install
npm run dev          # UI only — OTP uses a visible DEV code (no email sent)
# OR, to run the real /api functions locally:
npx vercel dev       # serves UI + serverless functions together
```
