import type { ProductControllerFindAll200 } from '@/shared/api/models';

// Requires the real backend and the marketplace seed (see docs/home-testing.md).
// Intercepts observe requests; they never stub a response.
describe('Public Home with seeded PostgreSQL data', () => {
  let mediaRequests: string[];
  beforeEach(() => {
    mediaRequests = [];
    cy.intercept('GET', '**/api/products/*/media', (request) => {
      mediaRequests.push(request.url);
      request.continue();
    });
    cy.intercept({
      method: 'GET',
      pathname: '/api/products',
      query: { page: /^\d+$/ },
    }).as('catalog');
    cy.visit('/');
    cy.wait('@catalog').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      const catalog = response?.body as ProductControllerFindAll200;
      expect(
        catalog.data.meta.total,
        'run the marketplace seed first',
      ).to.be.greaterThan(12);
    });
    cy.get('#new-arrivals article').should('have.length', 4);
  });

  it('opens a product preview using the cover in the list response', () => {
    cy.get('@catalog').then(({ response }) => {
      const product = (response?.body as ProductControllerFindAll200).data
        .items[0];
      cy.get('#new-arrivals article')
        .first()
        .within(() => {
          cy.get('img').should('have.attr', 'src', product.coverUrl);
          cy.contains(product.title!).should('be.visible');
          cy.get('button').click();
        });
      cy.get('[role="dialog"]')
        .should('be.visible')
        .within(() => {
          cy.contains(product.title!).should('be.visible');
          cy.get('img').should('have.attr', 'src', product.coverUrl);
          cy.get('button[aria-label="Close product preview"]').should(
            'be.visible',
          );
        });
      cy.press(Cypress.Keyboard.Keys.ESC);
      cy.get('[role="dialog"]').should('not.exist');
      cy.get('#new-arrivals article button').first().click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('button[aria-label="Close product preview"]').click();
      cy.get('[role="dialog"]').should('not.exist');
      cy.then(() => expect(mediaRequests).to.have.length(0));
    });
  });

  it('searches, shows empty results, and restores the catalog after clearing', () => {
    cy.get('form[aria-label="Search clothing"] input').type('denim{enter}');
    cy.wait('@catalog').then(({ request, response }) => {
      expect(request.query.search).to.equal('denim');
      const { items } = (response?.body as ProductControllerFindAll200).data;
      expect(items.length).to.be.greaterThan(0);
      expect(
        items.every(({ title }) => title?.toLowerCase().includes('denim')),
      ).to.equal(true);
    });
    cy.location('search').should('include', 'search=denim');
    cy.get('form[aria-label="Search clothing"] input')
      .clear()
      .type('no-such-piece-982746{enter}');
    cy.wait('@catalog');
    cy.contains('No pieces found').should('be.visible');
    cy.reload();
    cy.wait('@catalog');
    cy.contains('No pieces found').should('be.visible');
    cy.contains('button', 'Clear filters').click();
    cy.wait('@catalog');
    cy.location('search').should('not.include', 'search=');
    cy.get('#new-arrivals article').should('have.length', 12);
  });

  it('filters by category and shop, and paginates the full catalog', () => {
    cy.contains('[aria-label="Filter by category"] button', 'Tops').click();
    cy.wait('@catalog').then(({ response }) => {
      const { items } = (response?.body as ProductControllerFindAll200).data;
      expect(items.length).to.be.greaterThan(0);
      expect(items.every(({ category }) => category?.name === 'Tops')).to.equal(
        true,
      );
    });
    cy.contains('#new-arrivals button:visible', 'Browse all clothing').click();
    cy.wait('@catalog');
    cy.get('#new-arrivals article').should('have.length', 12);
    cy.contains('nav[aria-label="Product pages"] button', 'Next').click();
    cy.wait('@catalog');
    cy.location('search').should('include', 'page=2');
    cy.get('#new-arrivals article').should('have.length', 12);
    cy.get('section[aria-labelledby="shops-title"] article')
      .first()
      .find('h3')
      .invoke('text')
      .then((shopName) => {
        cy.get('section[aria-labelledby="shops-title"] article')
          .first()
          .contains('button', 'Explore shop')
          .click();
        cy.wait('@catalog').then(({ request, response }) => {
          const { items } = (response?.body as ProductControllerFindAll200)
            .data;
          expect(request.query.page).to.equal('1');
          expect(items.length).to.be.greaterThan(0);
          expect(
            items.every(({ shop }) => shop?.id === request.query.shopId),
          ).to.equal(true);
        });
        cy.location('search').should('not.include', 'page=2');
        cy.contains('[role="status"]', `Shop: ${shopName}`).should(
          'be.visible',
        );
      });
  });

  it('opens and submits the mobile search without horizontal overflow', () => {
    cy.viewport(390, 844);
    cy.get('button[aria-controls="mobile-search"]').click();
    cy.get('#mobile-search input').should('have.focus').type('denim{enter}');
    cy.wait('@catalog');
    cy.get('#mobile-search').should('not.be.visible');
    cy.location('search').should('include', 'search=denim');
    cy.document().then((document) => {
      expect(document.documentElement.scrollWidth).to.be.at.most(
        document.documentElement.clientWidth,
      );
    });
    cy.viewport(768, 1024);
    cy.get('button[aria-controls="mobile-search"]').click();
    cy.get('#mobile-search input').should('have.focus');
    cy.document().then((document) => {
      expect(document.documentElement.scrollWidth).to.be.at.most(
        document.documentElement.clientWidth,
      );
    });
  });
});
