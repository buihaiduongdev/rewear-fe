This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication setup

Copy `.env.example` to `.env` and configure:

- `NEXT_PUBLIC_API_URL`: public backend API URL, including the API prefix if configured.
- `AUTH_SECRET`: generate a secret with `openssl rand -base64 32`.
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: Google OAuth web client credentials.
- `AUTH_TRUST_HOST`: optional on Vercel, which Auth.js recognizes automatically.

Set these variables separately in each Vercel environment. Register the Google
callback URL as `https://<frontend-domain>/api/auth/callback/google` (and
`http://localhost:5000/api/auth/callback/google` for local development).
The backend `GOOGLE_CLIENT_ID` must match the frontend Google client ID.
Configure backend mail links to point to the frontend `/verify-email?token=...`
and `/reset-password?token=...` routes. Allow the frontend origin in backend CORS.

Auth routes: `/login`, `/register`, `/forgot-password`, `/reset-password`,
and `/verify-email`. Successful login returns to `/`.
Browser Axios requests automatically attach the session access token. Server
requests must supply an access token explicitly. A failed refresh signs the
browser out and redirects to `/login`.

Run `pnpm check` to verify TypeScript and lint. Real login, Google OAuth and mail
flows require a running backend and the credentials above.
