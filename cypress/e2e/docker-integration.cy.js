describe('Integration Docker', () => {
  it('affiche 0 inscrit au demarrage', () => {
    cy.visitHomeDocker();
    cy.assertHomePage();
    cy.assertRegisteredUsersCount(0);
  });

  it('inscrit un utilisateur via l api reelle', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.visitHomeDocker();
      cy.goToRegistrationForm();
      cy.fillRegistrationForm(validUser);
      cy.submitRegistrationForm();

      cy.url().should('include', '/list');
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
