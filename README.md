# Arclo – Client Review Form

Standalone testimonial form served at `/review`. Vite (vanilla JS), no runtime dependencies, branded with Arclo's tokens/fonts/wordmark from getarclo.com.

## Formspree
Submissions are POSTed (JSON, via `fetch`, no redirect) to the Arclo Client Testimonial Form: `https://formspree.io/f/meaapdbr`. To send them elsewhere (e.g. a test form), set `VITE_FORMSPREE_ENDPOINT` in `.env.local` or in Vercel's environment variables and rebuild. If the endpoint is ever blank, submitting shows an error and sends nothing.

## Fields received in Formspree
`name`, `business_name`, `email`, `rating` (1–5), `testimonial`, `business_results`, `permission_to_publish` (Yes/No), `publish_status` (APPROVED… / NOT APPROVED…), `submitted_at` (ISO UTC). Only publish entries where `permission_to_publish` is `Yes`, after you've reviewed them.

## Develop / deploy
- `npm install`, `npm run dev` → http://localhost:5173/review/
- `npm run build` → `dist/`. Deploy to Vercel (`vercel.json` rewrites `/` and `/review`, and sends `X-Robots-Tag: noindex`).
- If you'd rather serve it from getarclo.com/review, copy the built page and assets into that site instead.
