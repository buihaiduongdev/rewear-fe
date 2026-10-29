# Home integration testing

Home uses generated Orval queries against the backend. Product cards, shop previews
and quick view use `coverUrl` from the product response; they do not fetch the
media endpoint per card. Nullable product fields have display fallbacks. Public
visibility is decided by the backend's approved ACTIVE listing rules.

## Prepare real data

Use the backend version with product moderation and marketplace seeds (BE PR #18).
Follow its `docs/SEEDING.md` to populate an explicit development/test PostgreSQL
DB and start the backend against that same DB. The default seed creates 30 public
products, six categories and three shops, plus management-only states.

Point `NEXT_PUBLIC_API_URL` in the frontend `.env` to the backend, including `/api`
(for example `http://localhost:5001/api`). Backend CORS must allow the frontend URL.
The images in the demo dataset are external JPEGs and require browser network
access. No frontend mock server or fixtures are used.

## Run checks and browser tests

```bash
pnpm check
pnpm test
pnpm test:e2e:typecheck
pnpm build
pnpm start
```

In another terminal:

```bash
pnpm test:e2e --spec tests/cypress/e2e/home.cy.ts
```

The browser tests expect the app at `http://localhost:5000` (override with
`CYPRESS_BASE_URL` if necessary) and more than 12 public products from the seed.
They observe real network responses without stubbing them. They do not seed,
reset or delete database records.

Coverage includes guest access, cover URLs and absence of per-card media calls,
product quick view with mouse/keyboard dismissal, search/empty results/clear filters,
shareable search URLs after reload, category/shop filtering, pagination and mobile
search without horizontal overflow. The ordinary unit suite also checks proxy
rules so unrelated protected routes retain their login redirect.

## Scope

Home includes responsive header/hero/catalog/shop/selling/footer sections from the
Figma design. Quick view is a product preview, not a checkout or complete product
detail page. Cart is available through the header and mobile navigation; Orders and Messages remain disabled pending their frontend flows. A logged-in seller's listing CTA remains disabled until listing tools are
implemented; a guest can open registration. Policy and language text is static.

Full registration/login, upload/delete against R2, moderation in the browser,
checkout and payment need their own integration coverage.

Native Chrome QA additionally checks focus restoration and the dialog font outside
the Cypress iframe. Focus assertions inside that iframe differed from native
Chrome input and are not used as evidence of focus restoration.
