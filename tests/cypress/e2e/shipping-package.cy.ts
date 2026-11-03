// Use only the disposable seeded BE, never a shared or production database.
describe('Seller package details', () => {
  it('saves ranges and custom values, persists them, and submits the changed listing for review', () => {
    const api =
      Cypress.expose('PACKAGE_API_URL') || 'http://localhost:5008/api';
    let sellerToken = '';
    let adminToken = '';
    let id = '';
    let originalPackage: unknown = null;
    const sellerHeaders = () => ({ Authorization: `Bearer ${sellerToken}` });
    cy.request({
      method: 'POST',
      url: `${api}/auth/login`,
      body: {
        email: 'seller-1.demo@seed.rewear.test',
        password: 'RewearSeed123!',
      },
      log: false,
    }).then(({ body }) => {
      sellerToken = body.data.accessToken;
      cy.request({
        url: `${api}/products/me?status=ACTIVE&pageSize=20`,
        headers: sellerHeaders(),
        log: false,
      }).then(({ body: listings }) => {
        expect(listings.data.items.length).to.be.greaterThan(0);
        id = listings.data.items[0].id;
        originalPackage = listings.data.items[0].shippingPackage;
      });
    });
    cy.request({
      method: 'POST',
      url: `${api}/auth/login`,
      body: {
        email: 'admin.demo@seed.rewear.test',
        password: 'RewearSeed123!',
      },
      log: false,
    }).then(({ body }) => {
      adminToken = body.data.accessToken;
    });
    cy.visit('/login');
    cy.get('input[name="email"]').type('seller-1.demo@seed.rewear.test');
    cy.get('input[name="password"]').type('RewearSeed123!', { log: false });
    cy.get('form').contains('button', 'Sign in').click();
    cy.location('pathname', { timeout: 60000 }).should('eq', '/');
    cy.visit('/selling/packages');
    cy.then(() =>
      cy
        .get('[aria-label="Your listing"]')
        .should('not.be.disabled')
        .select(id),
    );
    cy.contains('Status: Published').should('be.visible');
    cy.get('[aria-label="Packed weight"]').select('');
    cy.get('[aria-label="Outer package size"]').select('');
    let saves = 0;
    cy.intercept('PATCH', '**/api/shipping/products/*/package', (req) => {
      saves++;
      req.continue();
    }).as('savePackage');
    cy.contains('button', 'Save package details').click();
    cy.get('[role="alert"]').should('contain.text', 'Choose a valid weight');
    cy.then(() => expect(saves).to.equal(0));
    cy.get('[aria-label="Packed weight"]').select('UP_TO_500_G');
    cy.get('[aria-label="Outer package size"]').select('BOX_30_20_15_CM');
    cy.get('output').should('contain.text', '500 g · 30 × 20 × 15 cm');
    cy.contains('button', 'Save package details').click();
    cy.wait('@savePackage').its('response.statusCode').should('eq', 200);
    cy.contains('Status: Draft').should('be.visible');
    cy.viewport(390, 912);
    cy.get('[aria-label="Packed weight"]').select('CUSTOM');
    cy.get('[aria-label="Outer package size"]').select('CUSTOM');
    cy.get('#package-grams').type('600');
    cy.get('#package-length').type('20.1');
    cy.get('#package-width').type('15.5');
    cy.get('#package-height').type('8.1');
    cy.get('output').should('contain.text', '600 g · 21 × 16 × 9 cm');
    cy.contains('button', 'Submit listing for review').should('be.disabled');
    cy.get('#package-grams').clear().type('50001');
    cy.contains('button', 'Save package details').click();
    cy.get('[role="alert"]').should('contain.text', 'Choose a valid weight');
    cy.then(() => expect(saves).to.equal(1));
    cy.get('#package-grams').clear().type('600');
    cy.contains('button', 'Save package details').click();
    cy.wait('@savePackage').its('response.statusCode').should('eq', 200);
    cy.contains('Package details saved.').should('be.visible');
    cy.reload();
    cy.then(() =>
      cy
        .get('[aria-label="Your listing"]')
        .should('not.be.disabled')
        .select(id),
    );
    cy.get('#package-grams').should('have.value', '600');
    cy.get('#package-length').should('have.value', '20.1');
    cy.get('#package-width').should('have.value', '15.5');
    cy.get('#package-height').should('have.value', '8.1');
    cy.window().its('innerWidth').should('eq', 390);
    cy.document().then((doc) =>
      expect(doc.documentElement.scrollWidth).to.be.at.most(
        doc.documentElement.clientWidth,
      ),
    );
    cy.contains('button', 'Submit listing for review').click();
    cy.contains('Status: Pending review').should('be.visible');
    cy.contains('Listing submitted for review.').should('be.visible');
    // Restore the picked seed listing via real seller/admin lifecycle APIs.
    cy.then(() =>
      cy.request({
        method: 'PATCH',
        url: `${api}/products/${id}`,
        headers: sellerHeaders(),
        body: { shippingPackage: originalPackage ?? null },
        log: false,
      }),
    );
    cy.then(() =>
      cy.request({
        method: 'POST',
        url: `${api}/products/${id}/submit`,
        headers: sellerHeaders(),
        body: {},
        log: false,
      }),
    ).then(({ body }) => {
      cy.request({
        method: 'POST',
        url: `${api}/products/admin/${id}/moderation`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { revision: body.data.revision, decision: 'APPROVE' },
        log: false,
      });
    });
  });
});
