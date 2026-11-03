// Uses the dedicated seeded backend; no network responses are stubbed.
describe('Cart with the real backend', () => {
  it('signs in, adds a piece, shows it in the cart, and removes it', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('buyer.demo@seed.rewear.test');
    cy.get('input[name="password"]').type('RewearSeed123!', { log: false });
    cy.get('form').contains('button', 'Sign in').click();
    cy.location('pathname', { timeout: 30000 }).should('eq', '/');
    cy.get('#new-arrivals article button', { timeout: 30000 }).first().click();
    cy.get('[role="dialog"]').contains('button', 'Add to cart').click();
    cy.contains('Added to cart', { timeout: 30000 }).should('be.visible');
    cy.contains('a', 'View cart').click();
    cy.location('pathname').should('eq', '/cart');
    cy.contains('h1', 'Your cart').should('be.visible');
    cy.contains('button', 'Remove', { timeout: 30000 }).click();
    cy.contains('Your cart is empty.', { timeout: 30000 }).should('be.visible');
  });
});
