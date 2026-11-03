// Runs against the disposable seed environment: FE 5006, BE 5007.
describe('Delivery address from checkout', () => {
  it('validates, resets the ward after changing province, saves, and snapshots the new address', () => {
    const api = 'http://localhost:5007/api';
    const name = `QA recipient ${Date.now()}`;
    let token = '';
    cy.request({
      method: 'POST',
      url: `${api}/auth/login`,
      body: {
        email: 'seller-2.demo@seed.rewear.test',
        password: 'RewearSeed123!',
      },
      log: false,
    }).then(({ body }) => {
      token = body.data.accessToken;
      cy.request({ url: `${api}/products`, log: false }).then(
        ({ body: catalog }) => {
          cy.request({
            method: 'PUT',
            url: `${api}/cart/items/${catalog.data.items.find((product: { sellerUserId: string | null }) => product.sellerUserId !== body.data.user.id).id}`,
            headers: { Authorization: `Bearer ${token}` },
            body: {},
            log: false,
          });
        },
      );
    });
    cy.visit('/login');
    cy.get('input[name="email"]').type('seller-2.demo@seed.rewear.test');
    cy.get('input[name="password"]').type('RewearSeed123!', { log: false });
    cy.get('form').contains('button', 'Sign in').click();
    cy.location('pathname', { timeout: 30000 }).should('eq', '/');
    cy.visit('/checkout');
    cy.contains('No delivery address saved.', { timeout: 30000 }).should(
      'be.visible',
    );
    cy.get('select[aria-label="Delivery address"]').should('be.disabled');
    cy.contains('button', 'Add address').click();
    let saves = 0;
    cy.intercept('POST', '**/api/user-addresses', (req) => {
      saves += 1;
      req.continue();
    }).as('save');
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Save address').click();
      cy.contains('Choose a province or city.').should('be.visible');
      cy.then(() => expect(saves).to.equal(0));
      cy.get('input[name="recipientName"]').type(`  ${name}  `);
      cy.get('input[name="phone"]').type('invalid');
      cy.get('input[name="addressLine1"]').type('Test delivery address');
      cy.get('select[aria-label="Province / City"]')
        .should('not.be.disabled')
        .find('option')
        .eq(1)
        .invoke('val')
        .then((code) =>
          cy.get('select[aria-label="Province / City"]').select(String(code)),
        );
      cy.get('select[aria-label="Ward"]')
        .should('not.be.disabled')
        .find('option')
        .eq(1)
        .invoke('val')
        .then((code) =>
          cy.get('select[aria-label="Ward"]').select(String(code)),
        );
      cy.get('select[aria-label="Province / City"]')
        .find('option')
        .eq(2)
        .invoke('val')
        .then((code) =>
          cy.get('select[aria-label="Province / City"]').select(String(code)),
        );
      cy.get('select[aria-label="Ward"]').should('have.value', '');
      cy.get('select[aria-label="Ward"]')
        .should('not.be.disabled')
        .find('option')
        .eq(1)
        .invoke('val')
        .then((code) =>
          cy.get('select[aria-label="Ward"]').select(String(code)),
        );
      cy.contains('button', 'Save address').click();
      cy.contains('Enter a phone number with 8–15 digits.').should(
        'be.visible',
      );
      cy.then(() => expect(saves).to.equal(0));
      cy.get('input[name="phone"]').clear().type('0912345678');
      cy.get('input[name="isDefault"]').check();
      cy.contains('button', 'Save address').click();
    });
    cy.wait('@save').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
      const address = response!.body.data;
      expect(address.recipientName).to.equal(name);
      cy.get('[role="dialog"]').should('not.exist');
      cy.get('select[aria-label="Delivery address"]').should(
        'have.value',
        address.id,
      );
      cy.intercept('POST', '**/api/checkouts').as('reserve');
      cy.contains('button', 'Reserve items').click();
      cy.wait('@reserve').then(({ response: checkout }) => {
        expect(checkout!.body.data.address.recipientName).to.equal(name);
        expect(
          checkout!.body.data.orders.every(
            (order: { address: { recipientName: string } }) =>
              order.address.recipientName === name,
          ),
        ).to.equal(true);
      });
      cy.contains('button', 'Cancel checkout').click();
      cy.get('[role="dialog"]').contains('button', 'Cancel checkout').click();
      cy.contains('Checkout cancelled.').should('be.visible');
      cy.then(() =>
        cy.request({
          method: 'DELETE',
          url: `${api}/user-addresses/${address.id}`,
          headers: { Authorization: `Bearer ${token}` },
          log: false,
        }),
      );
    });
  });
});
