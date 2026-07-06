describe('Tests en mode Offline - Reseau coupe', () => {
  beforeEach(() => {
    cy.prepareOfflineRegistration();
  });

  it("devrait afficher un message d'erreur quand le réseau est coupé", () => {
    // Le conteneur server est arrêté par la pipeline (docker compose stop server).
    // Pas de cy.intercept : la requête doit échouer naturellement (connexion refusée).
    cy.get('[data-cy="btn-sync"]').click();
    cy.get('[data-testid="error-toast"]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid="success-toast"]').should('not.exist');
  });
});
