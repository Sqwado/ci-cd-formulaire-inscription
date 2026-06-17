describe('Home page spec', () => {
  it('deployed react app to localhost', () => {
    const user = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      dateOfBirth: '1990-01-01',
      ville: 'Paris',
      codePostal: '75001'
    };

    cy.visitHomeWithRegistrations([user]);
    cy.wait('@getUsers');
    cy.assertRegisteredUsersCount(1);
    cy.get('[data-testid="users-registration-message"]').should(
      'contain',
      'utilisateur(s) déjà inscrit(s)'
    );
  });
});
