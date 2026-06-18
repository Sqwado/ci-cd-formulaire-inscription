describe('Tests en mode Offline - Reseau coupe', () => {
  beforeEach(() => {
    cy.prepareOfflineRegistration();
  });

  it("devrait afficher un message d'erreur quand le réseau est coupé", () => {
    cy.intercept('POST', `${(cy.env('REACT_APP_API_URL') || 'http://localhost:8000').replace(/\/$/, '')}/users`, {
      statusCode: 500,
      body: { detail: 'Erreur serveur' }
    }).as('syncRequest');
    cy.get('[data-cy="btn-sync"]').click();
    cy.wait('@syncRequest').its('response.statusCode').should('eq', 500);
    cy.get('[data-testid="error-toast"]').should('be.visible');
  });
});
