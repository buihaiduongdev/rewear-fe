# Pickup address UI

`/selling/pickup` configures the current personal seller's pickup address or an
owned shop's address. Only active OWNER memberships appear in the selector; the
backend remains the authorization boundary. Links are in the desktop account menu
and on the package page, including mobile. Back links target the implemented
package workspace; a full shop-settings screen is outside this increment.

The real administrative directory resets ward on province changes. Generated
Orval Zod validates the body after explicit text trimming (OpenAPI omits Zod trim
transforms). Cache keys include user and source. Save locks selection/fields and
cancels stale detail reads. Focus refetch is disabled while editing.

## Design and browser checks

Figwright read complete frame `63:2315`, its screenshot, component/token mappings
and motion inventory (none). Desktop form width 720px and 360×52 save action follow
that reference. BaseInputField and Button are reused. The added personal/shop
selector and existing filled-field geometry mean this is not a pixel-identical
copy of the entire frame. Mobile stacks the same fields and logic responsively.

Agent-browser MCP ran headless as requested, with real seed login, save, reload and
desktop/mobile screenshots. At 390px the page has no horizontal overflow. MCP core
omits viewport controls, so sizing uses the agent-browser CLI on the same session;
interaction and screenshots use MCP. No Chrome DevTools MCP was used.

## Reproducible E2E

Use only disposable seeded BE at 5010 and FE at 5011, configured with matching
API, Auth.js and CORS origins:

```bash
CYPRESS_BASE_URL=http://localhost:5011 pnpm test:e2e --spec tests/cypress/e2e/pickup-location.cy.ts
```

Two tests use documented seed credentials and real API/PostgreSQL: validation
without PUT, ward reset, trimmed save/edit, stable ID, reload persistence, 390px
overflow, independent shop/personal records and absence of pickup contact data
from public shop responses. Interception only observes real requests. Fixtures
remain in the disposable database; repeated runs replace the same source records.

This page does not register carrier pickup points, check availability, quote fees,
aggregate parcels or enable payment. The save result explicitly states that
shipping availability remains unverified.
