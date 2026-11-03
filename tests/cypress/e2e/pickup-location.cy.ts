// Disposable FE 5011 / seeded BE 5010. No API mocks or external carrier calls.
describe('Private pickup addresses', () => {
  const api = 'http://localhost:5010/api';
  const email = 'shop-owner-1.demo@seed.rewear.test';
  const login = () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('RewearSeed123!', { log: false });
    cy.get('form').contains('button', 'Sign in').click();
    cy.location('pathname', { timeout: 60000 }).should('eq', '/');
    cy.visit('/selling/pickup');
    cy.get('input[name="contactName"]').should('be.visible');
  };
  const chooseAddress = () => {
    cy.get('[aria-label="Province / City"]')
      .should('not.be.disabled')
      .find('option')
      .eq(1)
      .invoke('val')
      .then((code) =>
        cy.get('[aria-label="Province / City"]').select(String(code)),
      );
    cy.get('[aria-label="Ward / Commune"]')
      .should('not.be.disabled')
      .find('option')
      .eq(1)
      .invoke('val')
      .then((code) =>
        cy.get('[aria-label="Ward / Commune"]').select(String(code)),
      );
  };
  it('validates, resets ward, saves and edits the personal pickup address on mobile', () => {
    login();
    cy.viewport(390, 912);
    cy.get('input[name="contactName"]').clear();
    cy.get('input[name="phone"]').clear();
    cy.get('input[name="addressLine1"]').clear();
    cy.get('[aria-label="Province / City"]').select('');
    let saves = 0;
    cy.intercept('PUT', '**/api/shipping/pickup-location', (req) => {
      saves++;
      req.continue();
    }).as('save');
    cy.contains('button', 'Save pickup address').click();
    cy.contains('Choose a province or city.').should('be.visible');
    cy.then(() => expect(saves).to.equal(0));
    cy.get('input[name="contactName"]').type('  Personal pickup QA  ');
    cy.get('input[name="phone"]').type('invalid');
    cy.get('input[name="addressLine1"]').type('45 Test Street');
    chooseAddress();
    cy.get('[aria-label="Province / City"]')
      .find('option')
      .eq(2)
      .invoke('val')
      .then((code) =>
        cy.get('[aria-label="Province / City"]').select(String(code)),
      );
    cy.get('[aria-label="Ward / Commune"]').should('have.value', '');
    cy.contains('button', 'Save pickup address').click();
    cy.contains('Enter a phone number with 8–15 digits.').should('be.visible');
    cy.then(() => expect(saves).to.equal(0));
    cy.get('input[name="phone"]').clear().type('0912345678');
    cy.get('[aria-label="Ward / Commune"]')
      .should('not.be.disabled')
      .find('option')
      .eq(1)
      .invoke('val')
      .then((code) =>
        cy.get('[aria-label="Ward / Commune"]').select(String(code)),
      );
    cy.contains('button', 'Save pickup address').click();
    let locationId = '';
    cy.wait('@save').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      expect(response!.body.data.location.contactName).to.equal(
        'Personal pickup QA',
      );
      locationId = response!.body.data.location.id;
    });
    cy.contains('Pickup address saved.').should('be.visible');
    cy.reload();
    cy.get('input[name="contactName"]').should(
      'have.value',
      'Personal pickup QA',
    );
    cy.get('input[name="addressLine1"]').clear().type('46 Test Street');
    cy.contains('button', 'Save pickup address').click();
    cy.wait('@save').then(({ response }) =>
      expect(response!.body.data.location.id).to.equal(locationId),
    );
    cy.reload();
    cy.get('input[name="addressLine1"]').should('have.value', '46 Test Street');
    cy.window().its('innerWidth').should('eq', 390);
    cy.document().then((doc) =>
      expect(doc.documentElement.scrollWidth).to.be.at.most(
        doc.documentElement.clientWidth,
      ),
    );
  });
  it('saves a shop location separately and keeps contact data out of public shop responses', () => {
    let token = '';
    cy.request({
      method: 'POST',
      url: `${api}/auth/login`,
      body: { email, password: 'RewearSeed123!' },
      log: false,
    }).then(({ body }) => {
      token = body.data.accessToken;
    });
    login();
    cy.get('[aria-label="Selling as"]')
      .should('not.be.disabled')
      .find('option')
      .eq(1)
      .invoke('val')
      .then((value) => {
        const shopId = String(value);
        cy.get('[aria-label="Selling as"]').select(shopId);
        cy.get('input[name="contactName"]').clear().type('Shop pickup QA');
        cy.get('input[name="phone"]').clear().type('0987654321');
        cy.get('input[name="addressLine1"]').clear().type('90 Shop Street');
        chooseAddress();
        cy.intercept(
          'PUT',
          `**/api/shipping/shops/${shopId}/pickup-location`,
        ).as('shopSave');
        cy.contains('button', 'Save pickup address').click();
        cy.wait('@shopSave').its('response.statusCode').should('eq', 200);
        cy.contains('Pickup address saved.').should('be.visible');
        cy.reload();
        cy.get('[aria-label="Selling as"]')
          .should('not.be.disabled')
          .select(shopId);
        cy.get('input[name="contactName"]').should(
          'have.value',
          'Shop pickup QA',
        );
        cy.request({ url: `${api}/shops/${shopId}`, log: false }).then(
          ({ body }) => {
            expect(JSON.stringify(body.data)).not.to.contain('Shop pickup QA');
            expect(body.data).not.to.have.property('pickupLocation');
          },
        );
        cy.request({
          url: `${api}/shipping/pickup-location`,
          headers: { Authorization: `Bearer ${token}` },
          log: false,
        }).then(({ body }) => {
          expect(body.data.location?.contactName).not.to.equal(
            'Shop pickup QA',
          );
        });
        cy.get('[aria-label="Selling as"]').select('');
        cy.get('input[name="contactName"]').should(
          'not.have.value',
          'Shop pickup QA',
        );
      });
  });
});
