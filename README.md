# Arclo – Client Review Form

Standalone testimonial form served at `/review`. Vite (vanilla JS), no runtime dependencies, branded with Arclo's tokens/fonts/wordmark from getarclo.com.

## Connect Formspree
1. Create a form at https://formspree.io (notifications go to your account email).
2. Copy its endpoint (`https://formspree.io/f/xxxxxxxx`).
3. Locally: `cp .env.example .env.local` and paste it in. On Vercel: Project → Settings → Environment Variables → `VITE_FORMSPREE_ENDPOINT`, then redeploy (Vite bakes it in at build time).

Until it is set, submitting shows an error and nothing is sent (it never fakes success).

## Fields received in Formspree
`name`, `business_name`, `email`, `rating` (1–5), `testimonial`, `business_results`, `permission_to_publish` (Yes/No), `publish_status` (APPROVED… / NOT APPROVED…), `submitted_at` (ISO UTC). Only publish entries where `permission_to_publish` is `Yes`, after you've reviewed them.

## Develop / deploy
- `npm install`, `npm run dev` → http://localhost:5173/review/
- `npm run build` → `dist/`. Deploy to Vercel (`vercel.json` rewrites `/` and `/review`, and sends `X-Robots-Tag: noindex`).
- If you'd rather serve it from getarclo.com/review, copy the built page and assets into that site instead.
