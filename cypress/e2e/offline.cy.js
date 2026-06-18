const networkOffline = Cypress.env('offline');

describe('Tests en mode Offline', () => {
  beforeEach(() => {
    cy.fixture('users').then(({ validUser }) => {
      cy.visit('/');
      cy.goToRegistrationForm();
      cy.fillRegistrationForm(validUser);
      cy.submitRegistrationForm();
      cy.url().should('include', '/list');
    });
  });

  (networkOffline ? describe.skip : describe)('Synchronisation', () => {
    it('devrait se comporter correctement', () => {
      cy.intercept('POST', '**/users').as('syncRequest');
      cy.get('[data-cy="btn-sync"]').click();
      cy.wait('@syncRequest').its('response.statusCode').should('eq', 201);
      cy.get('@syncRequest').its('request.body.email').should('exist');
    });
  });

  (networkOffline ? describe : describe.skip)('Reseau coupe', () => {
    it("devrait afficher un message d'erreur quand le réseau est coupé", () => {
      cy.intercept('POST', '**/users', {
        statusCode: 500,
        body: { detail: 'Erreur serveur' }
      }).as('syncRequest');
      cy.get('[data-cy="btn-sync"]').click();
      cy.wait('@syncRequest').its('response.statusCode').should('eq', 500);
      cy.get('[data-testid="error-toast"]').should('be.visible');
    });
  });
});
