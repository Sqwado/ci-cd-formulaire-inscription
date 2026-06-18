describe('Page d accueil', () => {
  it('affiche la page d accueil et le compteur a zero', () => {
    cy.visitHomeWithRegistrations();
    cy.wait('@getUsers');
    cy.assertHomePage();
    cy.assertRegisteredUsersCount(0);
  });

  it('affiche le nombre d inscrits retourne par l api', () => {
    cy.fixture('users').then(({ validUser, secondUser }) => {
      cy.visitHomeWithRegistrations([validUser, secondUser]);
      cy.wait('@getUsers');
      cy.assertRegisteredUsersCount(2);
    });
  });

  it('permet d acceder a la liste des inscrits', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.visitHomeWithRegistrations([validUser]);
      cy.wait('@getUsers');
      cy.goToList();
      cy.wait('@getUsers');
      cy.assertRegistrationListCount(1);
      cy.assertRegistrationVisible(validUser);
    });
  });
});
