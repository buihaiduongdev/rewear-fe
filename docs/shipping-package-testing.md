# Seller package details

`/selling/packages` lets the signed-in seller choose an owned listing, declare its
packed weight and outer size using independent ranges or custom inputs, save, and
submit a complete draft for review. The desktop account menu links to this page.
This is an incremental package utility, not a complete seller listing editor.

Choices and limits come from `GET /shipping/package-options`. Generated Orval Zod
validates the save body; the backend remains authoritative. A changed published
listing returns to draft. HELD, SOLD and SUSPENDED listings are read-only. No fee,
shipment or payment is created.

The page uses shared components/state/API with responsive CSS. Dimensions are
stacked on mobile and in three columns from `sm`. Query keys include the current
user. Save and submit cancel stale detail requests and prevent overlapping edits.

## Local verification

Use a disposable seeded backend implementing SHIPPING_PACKAGE.md at port 5008 and
this frontend at port 5009, with matching Auth.js URL and CORS configuration.

```bash
CYPRESS_BASE_URL=http://localhost:5009 pnpm test:e2e --spec tests/cypress/e2e/shipping-package.cy.ts
```

The spec uses the documented seed seller/admin accounts and real JWT/API/database
traffic. It checks blank/oversized input does not save, preset upper bounds, custom
rounding, revision/review behavior, persisted values after reload and no horizontal
overflow at 390px. It restores the picked seed listing through seller/admin APIs
after success. Run only against a disposable seed database; interruption can leave
that fixture in draft/review. The API origin defaults to `http://localhost:5008/api`
and can be overridden with Cypress's non-sensitive `expose.PACKAGE_API_URL` config.

Interactive QA uses agent-browser MCP (real seed login, range/custom save, reload,
submit, sold-state lock and screenshots). The current MCP core profile omits the
viewport tool, so viewport sizing uses the agent-browser CLI connected to the same
session; subsequent interaction and measurement remain through MCP.

## Design reference and limits

Figwright inspected the existing seller listing editor `48:985` and Field component
`41:30` in Re.wear-design. The field screenshot was also checked. Existing marketplace
header, input components and Rewear tokens are reused. There is no dedicated package
screen in that reference, so this page is not claimed to match a full Figma frame.
Live carrier quotes and multi-item parcel aggregation remain future work.
