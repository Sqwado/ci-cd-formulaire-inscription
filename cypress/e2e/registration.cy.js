describe('Inscription', () => {
  it('parcours complet : accueil → formulaire → inscription valide → liste mise en evidence → accueil', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.visitHomeWithRegistrations();
      cy.wait('@getUsers');
      cy.assertRegisteredUsersCount(0);

      cy.goToRegistrationForm();
      cy.fillRegistrationForm(validUser);
      cy.submitRegistrationForm();
      cy.assertCreateUserPayload(validUser);

      cy.url().should('include', '/list');
      cy.wait('@getUsers');
      cy.assertRegistrationListCount(1);
      cy.assertRegistrationVisible(validUser);
      cy.assertHighlightedRegistration();

      cy.goToHome();
      cy.wait('@getUsers');
      cy.assertRegisteredUsersCount(1);
    });
  });

  it('rejette un formulaire invalide et conserve le nombre d inscrits', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.visitHomeWithRegistrations([validUser]);
      cy.wait('@getUsers');
      cy.assertRegisteredUsersCount(1);

      cy.goToRegistrationForm();
      cy.fillInvalidRegistrationForm();
      cy.get('.register-form').submit();

      cy.get('[data-testid="error-toast"]').should(
        'contain',
        'Veuillez corriger les erreurs du formulaire.'
      );
      cy.url().should('include', '/register');
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="submit"]').should('be.disabled');

      cy.goToHome();
      cy.wait('@getUsers');
      cy.assertRegisteredUsersCount(1);
    });
  });

  it('desactive le bouton tant que le formulaire est incomplet', () => {
    cy.visitHomeWithRegistrations();
    cy.goToRegistrationForm();

    cy.get('[data-testid="submit"]').should('be.disabled');
    cy.get('[data-testid="nom"]').type('Dupont');
    cy.get('[data-testid="submit"]').should('be.disabled');

    cy.fillValidRegistrationForm();
    cy.get('[data-testid="submit"]').should('be.enabled');
  });
});
