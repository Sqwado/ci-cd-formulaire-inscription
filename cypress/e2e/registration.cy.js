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
    cy.visitHomeWithRegistrations();
    cy.wait('@getUsers');
    cy.assertRegisteredUsersCount(0);

    cy.goToRegistrationForm();
    cy.fillValidRegistrationForm();
    cy.get('[data-testid="submit"]').click();
    cy.wait('@createUser');
    cy.url().should('include', '/list');

    cy.goToHome();
    cy.wait('@getUsers');
    cy.assertRegisteredUsersCount(1);
  });

  it('navigation accueil → formulaire → inscription invalide → accueil avec toujours 1 utilisateur', () => {
    cy.visitHomeWithRegistrations([existingUser]);
    cy.wait('@getUsers');
    cy.assertRegisteredUsersCount(1);

    cy.goToRegistrationForm();
    cy.fillInvalidRegistrationForm();
    cy.get('.register-form').submit();
    cy.get('[data-testid="error-toast"]').should(
      'contain',
      'Veuillez corriger les erreurs du formulaire.'
    );

    cy.goToHome();
    cy.wait('@getUsers');
    cy.assertRegisteredUsersCount(1);
  });
});
