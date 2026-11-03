// Requires the dedicated marketplace seed plus a delivery address for its buyer.
// All requests use the real app/backend; no responses are stubbed.
describe('Checkout reservations', () => {
  it('reserves, reloads without extending the deadline, cancels, and can reserve again', () => {
    const api = 'http://localhost:5004/api';
    cy.request({
      method: 'POST',
      url: `${api}/auth/login`,
      body: {
        email: 'buyer.demo@seed.rewear.test',
        password: 'RewearSeed123!',
      },
      log: false,
    }).then(({ body }) => {
      const headers = { Authorization: `Bearer ${body.data.accessToken}` };
      cy.request({ url: `${api}/products`, log: false }).then(
        ({ body: catalog }) => {
          cy.request({
            method: 'PUT',
            url: `${api}/cart/items/${catalog.data.items[0].id}`,
            headers,
            body: {},
            log: false,
          });
        },
      );
    });
    cy.visit('/login');
    cy.get('input[name="email"]').type('buyer.demo@seed.rewear.test');
    cy.get('input[name="password"]').type('RewearSeed123!', { log: false });
    cy.get('form').contains('button', 'Sign in').click();
    cy.location('pathname', { timeout: 30000 }).should('eq', '/');
    cy.visit('/checkout');
    cy.get('select[aria-label="Delivery address"]').should('not.be.disabled');
    cy.intercept('POST', '**/api/checkouts').as('reserve');
    cy.contains('button', 'Reserve items').click();
    cy.wait('@reserve').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      const original = response!.body.data;
      expect(original.status).to.equal('HELD');
      cy.location('search').should('contain', original.id);
      cy.contains('Reserved ·').should('be.visible');
      cy.intercept('GET', `**/api/checkouts/${original.id}`).as(
        'reloadCheckout',
      );
      cy.reload();
      cy.wait('@reloadCheckout').then(({ response: reloaded }) => {
        expect(reloaded!.body.data.expiresAt).to.equal(original.expiresAt);
      });
      cy.contains('button', 'Payment unavailable').should('be.disabled');
      cy.viewport(390, 912);
      cy.document().its('documentElement.scrollWidth').should('be.lte', 390);
      cy.screenshot('checkout-mobile-390', { capture: 'fullPage' });
      cy.viewport(1280, 900);
      cy.contains('button', 'Cancel checkout').click();
      cy.get('[role="dialog"]').contains('button', 'Cancel checkout').click();
      cy.contains('Checkout cancelled.', { matchCase: false }).should(
        'be.visible',
      );
      cy.contains('a', 'Back to cart').click();
      cy.contains('a', 'Continue to checkout').click();
      cy.contains('button', 'Reserve items').click();
      cy.wait('@reserve').then(({ response: repeated }) => {
        expect(repeated!.body.data.status).to.equal('HELD');
        expect(repeated!.body.data.id).not.to.equal(original.id);
      });
      cy.contains('button', 'Cancel checkout').click();
      cy.get('[role="dialog"]').contains('button', 'Cancel checkout').click();
      cy.contains('Checkout cancelled.', { matchCase: false }).should(
        'be.visible',
      );
    });
  });
});
