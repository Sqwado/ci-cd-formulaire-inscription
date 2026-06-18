describe('Liste des inscrits', () => {
  it('affiche un message quand aucun inscrit n existe', () => {
    cy.visitListWithRegistrations();
    cy.assertRegistrationListCount(0);
    cy.get('[data-testid="list-registrations-section"]').should('contain', 'Liste des inscrits');
  });

  it('affiche plusieurs inscrits retournes par l api', () => {
    cy.fixture('users').then(({ validUser, secondUser }) => {
      cy.visitListWithRegistrations([validUser, secondUser]);
      cy.assertRegistrationListCount(2);
      cy.assertRegistrationVisible(validUser);
      cy.assertRegistrationVisible(secondUser);
    });
  });

  it('permet de revenir a l accueil depuis la liste', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.visitListWithRegistrations([validUser]);
      cy.goToHome();
      cy.wait('@getUsers');
      cy.assertHomePage();
      cy.assertRegisteredUsersCount(1);
    });
  });

  it('charge la liste via une URL directe', () => {
    cy.mockUsersApi([]);
    cy.visit('/list');
    cy.wait('@getUsers');
    cy.assertRegistrationListCount(0);
    cy.get('[data-testid="list-registrations-section"]').should('be.visible');
  });

  it('n affiche pas l email dans la liste publique', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.visitListWithRegistrations([validUser]);
      cy.get('[data-testid="registration-item"]')
        .should('contain', `${validUser.prenom} ${validUser.nom}`)
        .and('not.contain', validUser.email)
        .and('not.contain', validUser.ville);
    });
  });
});
