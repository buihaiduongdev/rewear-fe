# Checkout reservation UI

Based on the cart implementation and the Figma checkout content
`53:2098` in Re.wear-design. Payment and shipping quote controls are not enabled.
This increment supports choosing saved cart items and an existing delivery address,
creating a 10-minute reservation, reloading the saved checkout URL, and cancelling.
The address snapshot and merchandise subtotal are shown, with shipping pending.

Run the backend checkout branch and marketplace seed against a disposable database.
Create a delivery-address fixture for `buyer.demo@seed.rewear.test` in that same
DB. The seed currently does not include addresses; this UI only selects existing
addresses and does not yet provide the address-creation screen.
Set NEXT_PUBLIC_API_URL to that backend's /api URL and allow the FE origin in CORS.

```bash
CYPRESS_BASE_URL=http://localhost:5005 pnpm test:e2e --spec tests/cypress/e2e/checkout.cy.ts
```

The test prepares a cart item through the real backend API, signs in through the
app, reserves it, reloads to check the unchanged deadline, cancels,
and repeats with a fresh checkout ID. No API responses are stubbed. Run only
against the disposable seed environment; it mutates that fixture buyer's cart and
reservations. The shared /api/checkouts response includes server-owned status and
expiresAt; the countdown is a display updated locally, with a server poll every
five seconds to reconcile expiry.

Changing items or address after reservation requires cancelling and starting a new
checkout. Reservation confirmation/cancellation calls invalidate the account-scoped
cart query. A request ID is retained in sessionStorage for failed-request retries;
a successful response removes it and navigates to the checkout ID in the URL.

This fixture suite targets the backend at http://localhost:5004/api.

The browser suite also switches to 390x912, asserts no horizontal overflow and
saves a full-page checkout screenshot. Cancellation uses a confirmation dialog.
