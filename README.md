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
- `AUTH_TRUST_HOST=true`: required for local production runs (`pnpm start`); optional on Vercel, which Auth.js recognizes automatically. In other deployments, enable it only when the hosting platform safely sets the host headers.

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

## API client generation

Orval uses `openapi/rewear.json` to generate all current operations, grouped by
backend tags:

| Output                                | Location                          | Purpose                                                     |
| ------------------------------------- | --------------------------------- | ----------------------------------------------------------- |
| Axios functions and TypeScript models | `src/shared/api/generated/`       | Server or browser API calls                                 |
| React Query hooks, keys and options   | `src/shared/api/query-generated/` | Queries and mutations in client components                  |
| Zod schemas                           | `src/shared/api/zod-generated/`   | Runtime validation of bodies, params, queries and responses |

Commit the snapshot and generated files together; do not edit generated files.
Keep server imports on the Axios functions: Auth.js must not import React hooks.

```bash
pnpm api:generate
```

After changing backend contracts, refresh the snapshot from a running backend
(adjust the port to match your backend), then regenerate:

```bash
curl --fail http://localhost:3000/api/docs-json -o openapi/rewear.json
pnpm api:generate
pnpm check
```

For a one-off generation from another URL or local JSON file:

```bash
OPENAPI_INPUT=http://localhost:3000/api/docs-json pnpm api:generate
```

This override does not update the committed snapshot. The initial snapshot was
exported by the backend HTTP contract suite using all current controllers and
mocked persistence, without a running database.

The custom transport uses `NEXT_PUBLIC_API_URL`, which includes `/api`, and
removes the duplicate prefix from generated paths. Clients return the documented
`{ statusCode, message, data }` envelope. Auth.js calls the generated operations directly and reads `response.data`.
The transport preserves login error codes and bypasses browser session lookup
so it also works inside Auth.js server callbacks. Other clients reuse the shared Axios session handling;
server callers must pass the bearer token in request options.

Auth forms use generated mutation hooks and extend generated Zod request schemas
with UI-only rules such as confirmation and consent. The transport validates all
successful auth responses with generated Zod schemas. Auth.js session logic,
toasts and navigation stay handwritten. Form schemas live in
`src/modules/auth/schemas/`, and each feature hook owns its form,
mutation callbacks and navigation. Toast durations are defined in
`src/shared/constants/toast.ts`. Credentials login uses the generated login schema directly in both the form and
Auth.js. `/auth/login` accepts `{ email, password }`; `/auth/oauth` accepts
`{ provider: "google", token }`. Other OAuth providers are rejected until implemented. `auth.session.ts` contains only token mapping and refresh
concurrency handling; there is no extra API service, mutation-options layer or
handwritten alias for generated API types. Other modules have all outputs generated
and available for subsequent feature work; their responses are not automatically
parsed just because a Zod schema exists.

## Regression tests

```bash
pnpm test
pnpm test:watch
```

Vitest checks auth form validation and missing-token recovery in jsdom.

## Cypress browser regression tests

Cypress specs and their TypeScript config live under `tests/cypress/`.

Start the app in normal mode (`pnpm dev`), then in another terminal:

```bash
pnpm test:e2e
pnpm test:e2e:open
pnpm test:e2e:typecheck
```

Cypress targets `http://localhost:5000`. Override it with `CYPRESS_BASE_URL` if
using another port. The headless command uses installed Chrome. Cypress is allowed to install its
browser binary through the pnpm build policy; if the cache is missing, run
`pnpm exec cypress install`.

The current Cypress suite checks registration form validation and missing-token
recovery. Full end-to-end auth coverage against a running backend and a
dedicated seeded test database remains to be implemented.

Vitest and Cypress use separate TypeScript scopes to prevent their assertion
types from conflicting. Failure screenshots are saved to `tests/cypress/screenshots/`
and ignored by Git. Tests do not suppress application exceptions.

For repeatable runs without development compilation delays, use a production
server with `AUTH_SECRET` configured as above (keep the last command running):

```bash
pnpm build
AUTH_TRUST_HOST=true pnpm exec next start --port 5002
```

Then run in another terminal:

```bash
CYPRESS_BASE_URL=http://localhost:5002 pnpm test:e2e
```
