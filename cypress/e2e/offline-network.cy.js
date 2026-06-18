const { apiUrl } = require('../support/apiConfig');

describe('Tests en mode Offline - Reseau coupe', () => {
  beforeEach(() => {
    cy.prepareOfflineRegistration();
  });

  it("devrait afficher un message d'erreur quand le réseau est coupé", () => {
    cy.intercept('POST', apiUrl('/users'), {
      statusCode: 500,
      body: { detail: 'Erreur serveur' }
    }).as('syncRequest');
    cy.get('[data-cy="btn-sync"]').click();
    cy.wait('@syncRequest').its('response.statusCode').should('eq', 500);
    cy.get('[data-testid="error-toast"]').should('be.visible');
  });
});
