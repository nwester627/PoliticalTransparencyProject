Vercel Deployment Guide

Steps to deploy this Next.js app to Vercel

1. Create / Sign in to Vercel

   - Visit https://vercel.com and sign in with GitHub.

2. Import Project

   - Choose "Import Project" and select this repository (`nwester627/political_project`).
   - Vercel should detect Next.js automatically.

3. Environment Variables (important)

   - In the Vercel project settings, add these environment variables (Production & Preview):
     - `NEXT_PUBLIC_FEC_API_KEY` — your FEC API key (https://api.open.fec.gov)
     - `NEXT_PUBLIC_CONGRESS_API_KEY` — (optional) Congress.gov API key
   - Do NOT commit real keys to the repository; use the Vercel dashboard.

4. Build & Output

   - Default build command: `npm run build`
   - Dev server: `npm run dev`
   - Next.js uses the App Router; Edge Functions/AWS-style functions are handled automatically.

5. Optional - Preview locals

   - Create `.env.local` from `.env.example` and run:
     ```powershell
     npm install
     npm run dev
     ```

6. Notes & Limitations
   - The app hits third-party APIs (FEC, Congress.gov). Ensure you have API keys and have set rate limits / caching appropriately.
   - Server routes in `src/app/api/*` are deployed as Serverless Functions or Edge Functions depending on Next.js configuration.
   - If you need higher function memory or longer timeouts, configure those in Vercel project options per-function.

If you want, I can create a feature branch and open a Pull Request with these changes instead of pushing to `main` directly.
