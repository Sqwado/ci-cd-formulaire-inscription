describe('Integration Docker', () => {
  it('affiche 0 inscrit au demarrage', () => {
    cy.intercept('GET', '**/users').as('getUsers');
    cy.visitHomeDocker();
    cy.wait('@getUsers');
    cy.assertHomePage();
    cy.assertRegisteredUsersCount(0);
  });

  it('inscrit un utilisateur via l api reelle', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.intercept('POST', '**/users').as('createUser');
      cy.intercept('GET', '**/users').as('getUsers');

      cy.visitHomeDocker();
      cy.wait('@getUsers');
      cy.goToRegistrationForm();
      cy.fillRegistrationForm(validUser);
      cy.submitRegistrationForm();

      cy.wait('@createUser');
      cy.url().should('include', '/list');
      cy.wait('@getUsers');
      cy.assertRegistrationListCount(1);
      cy.assertRegistrationVisible(validUser);

      cy.request('GET', 'http://localhost:8000/users').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.users).to.have.length(1);
        expect(response.body.users[0].email).to.eq(validUser.email);
      });
    });
  });
});
