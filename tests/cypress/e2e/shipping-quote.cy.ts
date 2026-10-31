// Real disposable BE/PG and GHN sandbox preview. Never run on shared databases.
describe('One seller, one sandbox shipping estimate', () => {
  const api = 'http://localhost:5014/api';
  let heldId = '',
    buyerToken = '';
  afterEach(() => {
    if (heldId && buyerToken)
      cy.request({
        method: 'POST',
        url: `${api}/checkouts/${heldId}/cancel`,
        headers: { Authorization: `Bearer ${buyerToken}` },
        body: {},
        log: false,
      });
  });
  const loginApi = (email: string) =>
    cy
      .request({
        method: 'POST',
        url: `${api}/auth/login`,
        body: { email, password: 'RewearSeed123!' },
        log: false,
      })
      .then(({ body }) => body.data.accessToken as string);
  const headers = (token: string) => ({ Authorization: `Bearer ${token}` });
  it('quotes two items as one parcel, restores the estimate, hides expired fees and invalidates on cancellation', () => {
    let seller = '',
      admin = '',
      buyer = '',
      addressId = '',
      subtotal = 0,
      quoteId = '';
    let products: Array<{ id: string }> = [];
    let ward = '';
    const vnd = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });
    loginApi('seller-1.demo@seed.rewear.test').then((token) => {
      seller = token;
    });
    loginApi('admin.demo@seed.rewear.test').then((token) => {
      admin = token;
    });
    loginApi('buyer.demo@seed.rewear.test').then((token) => {
      buyer = token;
      buyerToken = token;
    });
    cy.request({
      url: `${api}/administrative-divisions/provinces/79/wards`,
      log: false,
    }).then(({ body }) => {
      ward = body.data.find(
        (item: { name: string }) => item.name === 'Phường Sài Gòn',
      ).code;
    });
    cy.then(() =>
      cy.request({
        url: `${api}/products/me?status=ACTIVE&pageSize=20`,
        headers: headers(seller),
        log: false,
      }),
    ).then(({ body }) => {
      products = body.data.items.slice(0, 2);
      expect(products).to.have.length(2);
      products.forEach((product, index) => {
        cy.request({
          method: 'PATCH',
          url: `${api}/shipping/products/${product.id}/package`,
          headers: headers(seller),
          body: {
            weight: { mode: 'CUSTOM', grams: index ? 500 : 300 },
            size: {
              mode: 'CUSTOM',
              lengthCm: index ? 30 : 20,
              widthCm: index ? 20 : 15,
              heightCm: index ? 15 : 10,
            },
          },
          log: false,
        }).then(({ body: updated }) => {
          if (updated.data.status === 'DRAFT')
            cy.request({
              method: 'POST',
              url: `${api}/products/${product.id}/submit`,
              headers: headers(seller),
              body: {},
              log: false,
            }).then(({ body: submitted }) =>
              cy.request({
                method: 'POST',
                url: `${api}/products/admin/${product.id}/moderation`,
                headers: headers(admin),
                body: {
                  revision: submitted.data.revision,
                  decision: 'APPROVE',
                },
                log: false,
              }),
            );
        });
      });
    });
    cy.then(() =>
      cy.request({
        method: 'PUT',
        url: `${api}/shipping/pickup-location`,
        headers: headers(seller),
        body: {
          contactName: 'Sandbox seller',
          phone: '0912345678',
          addressLine1: '45 Test Street',
          provinceCode: '79',
          wardCode: ward,
        },
        log: false,
      }),
    );
    cy.then(() =>
      cy.request({
        method: 'POST',
        url: `${api}/user-addresses`,
        headers: headers(buyer),
        body: {
          recipientName: 'Sandbox buyer',
          phone: '0987654321',
          addressLine1: '46 Test Street',
          provinceCode: '79',
          wardCode: ward,
        },
        log: false,
      }),
    ).then(({ body }) => {
      addressId = body.data.id;
    });
    cy.then(() =>
      cy.request({ url: `${api}/cart`, headers: headers(buyer), log: false }),
    ).then(({ body }) =>
      body.data.groups.forEach(
        (group: { items: Array<{ productId: string }> }) =>
          group.items.forEach((item) =>
            cy.request({
              method: 'DELETE',
              url: `${api}/cart/items/${item.productId}`,
              headers: headers(buyer),
              log: false,
            }),
          ),
      ),
    );
    cy.then(() =>
      products.forEach((product) =>
        cy.request({
          method: 'PUT',
          url: `${api}/cart/items/${product.id}`,
          headers: headers(buyer),
          body: {},
          log: false,
        }),
      ),
    );
    cy.visit('/login');
    cy.get('input[name="email"]').type('buyer.demo@seed.rewear.test');
    cy.get('input[name="password"]').type('RewearSeed123!', { log: false });
    cy.get('form').contains('button', 'Sign in').click();
    cy.location('pathname', { timeout: 60000 }).should('eq', '/');
    cy.visit('/checkout');
    cy.then(() =>
      cy
        .get('[aria-label="Delivery address"]')
        .should('not.be.disabled')
        .select(addressId),
    );
    cy.intercept('POST', '**/api/checkouts').as('hold');
    cy.contains('button', 'Reserve items').click();
    cy.wait('@hold').then(({ response }) => {
      heldId = response!.body.data.id;
      subtotal = response!.body.data.subtotal;
      expect(response!.body.data.orders).to.have.length(1);
    });
    cy.contains('button', 'Get shipping estimate', { timeout: 20000 }).should(
      'be.visible',
    );
    cy.intercept('POST', '**/api/checkouts/*/shipping-quotes').as('quote');
    cy.contains('button', 'Get shipping estimate').click();
    cy.wait('@quote', { responseTimeout: 20000 }).then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      const quote = response!.body.data;
      expect(quote.status).to.equal('READY');
      expect(quote.environment).to.equal('SANDBOX');
      expect(quote.orders).to.have.length(1);
      expect(quote.orders[0]).to.include({ parcelCount: 1, itemCount: 2 });
      expect(quote.orders[0].parcel).to.deep.equal({
        weightGrams: 800,
        lengthCm: 30,
        widthCm: 20,
        heightCm: 25,
      });
      expect(quote.totalShippingFee).to.be.greaterThan(0);
      expect(quote.grandTotal).to.equal(subtotal + quote.totalShippingFee);
      quoteId = quote.id;
      cy.get('[aria-label="Estimated checkout total"]').should(
        'contain.text',
        vnd.format(quote.grandTotal),
      );
    });
    cy.contains('GHN sandbox estimate').should('be.visible');
    cy.contains('1 parcel · 2 items').should('be.visible');
    cy.contains('button', 'Payment unavailable').should('be.disabled');
    let clock: Cypress.Clock;
    // Capture the time when this command runs, after API fixtures and preview.
    // Capturing at test declaration time makes the clock older than the quote.
    cy.then(() =>
      cy.clock(Date.now(), ['Date', 'setInterval', 'clearInterval']),
    ).then((value) => {
      clock = value;
    });
    cy.reload();
    cy.get('[aria-label="Estimated checkout total"]').should('be.visible');
    cy.location('search').then((search) => {
      const id = new URLSearchParams(search).get('id');
      cy.request({
        url: `${api}/checkouts/${id}`,
        headers: headers(buyer),
        log: false,
      }).then(({ body }) =>
        expect(body.data.shippingQuote.id).to.equal(quoteId),
      );
    });
    cy.viewport(390, 912);
    cy.document().then((doc) =>
      expect(doc.documentElement.scrollWidth).to.be.at.most(
        doc.documentElement.clientWidth,
      ),
    );
    cy.tick(121000);
    cy.contains('Shipping estimate expired.').should('be.visible');
    cy.get('[aria-label="Estimated checkout total"]').should('not.exist');
    cy.then(() => clock.restore());
    cy.reload();
    cy.contains('button', 'Cancel checkout').click();
    cy.get('[role="dialog"]').contains('button', 'Cancel checkout').click();
    cy.contains('Checkout cancelled.').should('be.visible');
    cy.get('[aria-label="Estimated checkout total"]').should('not.exist');
    // Keep this address in the disposable database for interactive agent-browser QA.
  });
});
