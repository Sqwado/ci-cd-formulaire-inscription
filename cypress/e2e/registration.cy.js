describe('Inscription - tests e2e', () => {
  const existingUser = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    dateOfBirth: '1990-01-01',
    ville: 'Paris',
    codePostal: '75001'
  };

  it('navigation accueil → formulaire → inscription valide → accueil avec 1 utilisateur', () => {
    // Navigation vers la page → Aucun utilisateur inscrit
    cy.visitHomeWithRegistrations();
    cy.assertRegisteredUsersCount(0);

    // Navigation vers la page de formulaire
    cy.goToRegistrationForm();

    // Ajout d'un nouvel utilisateur sans erreur
    cy.fillValidRegistrationForm();
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/list');

    // Navigation vers la page d'accueil → Un utilisateur inscrit
    cy.goToHome();
    cy.assertRegisteredUsersCount(1);
  });

  it('navigation accueil → formulaire → inscription invalide → accueil avec toujours 1 utilisateur', () => {
    // Navigation vers la page → 1 utilisateur inscrit
    cy.visitHomeWithRegistrations([existingUser]);
    cy.assertRegisteredUsersCount(1);

    // Navigation vers la page de formulaire
    cy.goToRegistrationForm();

    // Ajout d'un nouvel utilisateur avec erreur
    cy.fillInvalidRegistrationForm();
    cy.get('.register-form').submit();
    cy.get('[data-testid="error-toast"]').should(
      'contain',
      'Veuillez corriger les erreurs du formulaire.'
    );

    // Navigation vers la page d'accueil → Toujours 1 utilisateur inscrit
    cy.goToHome();
    cy.assertRegisteredUsersCount(1);
  });
});
