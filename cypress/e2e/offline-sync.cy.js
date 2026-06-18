describe('Tests en mode Offline - Synchronisation', () => {
  beforeEach(() => {
    cy.prepareOfflineRegistration();
  });

  it('devrait se comporter correctement', () => {
    cy.intercept('POST', `${(Cypress.env('REACT_APP_API_URL') || 'http://localhost:8000').replace(/\/$/, '')}/users`).as('syncRequest');
    cy.get('[data-cy="btn-sync"]').click();
    cy.wait('@syncRequest').its('response.statusCode').should('eq', 201);
    cy.get('@syncRequest').its('request.body.email').should('exist');
  });
});
