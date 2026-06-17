describe('Gestion des erreurs API', () => {
  it('affiche 0 inscrit sur l accueil quand le GET echoue', () => {
    cy.mockUsersApiGetError();
    cy.visit('/');
    cy.wait('@getUsersError');
    cy.assertRegisteredUsersCount(0);
    cy.assertHomePage();
  });

  it('affiche un toast d erreur sur la liste quand le GET echoue', () => {
    cy.mockUsersApiGetError();
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
      }
    });
    cy.wait('@getUsersError');
    cy.goToList();
    cy.wait('@getUsersError');
    cy.get('[data-testid="error-toast"]').should('be.visible');
    cy.assertRegistrationListCount(0);
  });

  it('affiche un toast et reste sur le formulaire quand le POST echoue', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.mockUsersApi();
      cy.visit('/');
      cy.goToRegistrationForm();

      cy.mockUsersApiPostError();
      cy.fillRegistrationForm(validUser);
      cy.submitRegistrationForm();

      cy.wait('@createUserError');
      cy.get('[data-testid="error-toast"]').should('be.visible');
      cy.url().should('include', '/register');
      cy.get('[data-testid="registration-page"]').should('be.visible');
    });
  });
});
