# MultiUNO (Next.js + React + Tailwind)

This project was migrated from static HTML/CSS/JS to a Next.js App Router app.

## Stack

- Next.js (React)
- Tailwind CSS
- Firebase Realtime Database (compat SDK loaded in browser)

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Setup

1. Copy values from `.env.example` into `.env.local`.
2. Put your Firebase web app credentials in `.env.local`.
3. Restart `npm run dev` after changing env values.

If Firebase env values are missing (or demo placeholders are used), online mode gracefully falls back to local mode.

## Migration Notes

- Legacy UNO game markup is rendered by React from [lib/legacyMarkup.js](lib/legacyMarkup.js).
- Legacy scripts are served from `public/js` in original dependency order.
- Legacy styles are served from `public/css` and loaded in [app/layout.js](app/layout.js).
- Tailwind is configured and ready for progressive React component refactors.
