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

  it('devrait se comporter correctement', () => {
    if (!Cypress.env('offline')) {
      cy.intercept('POST', '**/users').as('syncRequest');
      cy.get('[data-cy="btn-sync"]').click();
      cy.wait('@syncRequest').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
        expect(interception.request.body.email).to.exist;
      });
    }
  });

  it("devrait afficher un message d'erreur quand le réseau est coupé", () => {
    if (Cypress.env('offline')) {
      cy.log('Mode offline activé !');
      cy.intercept('POST', '**/users', {
        statusCode: 500,
        body: { detail: 'Erreur serveur' }
      }).as('syncRequest');
      cy.get('[data-cy="btn-sync"]').click();
      cy.wait('@syncRequest').then((interception) => {
        expect(interception.response.statusCode).to.equal(500);
      });
      cy.get('[data-testid="error-toast"]').should('be.visible');
    }
  });
});
