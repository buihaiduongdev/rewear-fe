# PayOS checkout frontend

Uses the existing backend contracts without modifying backend or sending a live payment during development checks.

- Checkout uses PayOS/VietQR and a complete shipping quote, active reservation and authenticated buyer.
- Payment client is regenerated from the running backend Payments tag. Other OpenAPI tags retain their committed snapshot.
- Request UUID survives ambiguous errors; a retry after a definitively FAILED payment uses its own stable UUID.
- The current payment pointer is stored per signed-in buyer in sessionStorage before navigation. Return from the same tab/browser session is supported. A fresh browser/device without that context offers Orders; callback orderCode/status are not used to guess a payment or mark it paid.
- Both `/payment-result` and `/payment-cancel` read authenticated backend status. Cancellation return never cancels the checkout automatically. Pending status polls up to 24 successful refreshes, with manual reconciliation available afterward.
- Changed server amount is displayed for explicit review before continuing to the hosted HTTPS PayOS checkout. Existing unresolved payments are checked or resumed instead of replaced.
- Server refund/review states stay distinct from payment success. PayOS bank refunds are still an operator/backend concern; the frontend does not invent automatic refunds.

## Local setup

Keep the frontend environment API URL aligned with the actual backend port, e.g. `NEXT_PUBLIC_API_URL=http://localhost:5001/api`. Keep PayOS keys server-only.

Set backend redirect URLs to the actual frontend origin plus `/payment-result` and `/payment-cancel`. Webhook remains the public backend URL plus `/api/payments/payos/webhook`, independent from frontend redirects.

Check incomplete quote, expired checkout, lost create response, double clicks, storage errors, account-specific context, spoofed callback parameters, pending/cancel, PAID, FAILED, REFUND_REQUIRED and missing-context recovery. Tests mock payment calls; real PayOS creation/capture was not exercised.

Design: existing Figma reference 48:571; supplementary editable PayOS states are in section 228:352 of Re.wear-design. UI keeps existing marketplace components and color/typography tokens.

## Verification on 2026-11-28

- Production build passes with locally hosted original DM Sans and Geist Mono variable fonts, including their SIL OFL licenses. No Google Fonts download is needed during build.
- Vitest: 19 files, 57 tests pass. TypeScript noEmit and full ESLint pass.
- Browser checkout correctly blocks payment when shipping cannot be quoted. Seed pickups were not connected to GHN; connecting Second Story through the existing GHN Sandbox API returned UNKNOWN. Do not retry creation blindly: review the remote shop and resolve the uncertain connection through the supported backend flow first.
- No PayOS payment link or real transfer was created during this runtime check. Actual payment, webhook processing, order creation and reconciliation still require an end-to-end verification after valid shipping quotes are available.
