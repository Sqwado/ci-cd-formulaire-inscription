describe('Administration', () => {
  beforeEach(() => {
    cy.mockUsersApi([]);
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { token: 'test-admin-token', email: 'loise.fenoll@ynov.com' }
    }).as('adminLogin');
  });

  it('permet a un admin de se connecter et supprimer un inscrit', () => {
    const user = {
      id: 1,
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@email.com',
      dateOfBirth: '1990-01-01',
      ville: 'Paris',
      codePostal: '75001'
    };

    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: { users: [{ id: user.id, prenom: user.prenom, nom: user.nom }] }
    }).as('getUsers');

    cy.intercept('GET', `**/users/${user.id}`, {
      statusCode: 200,
      body: user
    }).as('getUserDetail');

    cy.intercept('DELETE', `**/users/${user.id}`, {
      statusCode: 204
    }).as('deleteUser');

    cy.visit('/admin/login');
    cy.get('[data-testid="admin-email"]').type('loise.fenoll@ynov.com');
    cy.get('[data-testid="admin-password"]').type('PvdrTAzTeR247sDnAZBr');
    cy.get('[data-testid="admin-login-submit"]').click();
    cy.wait('@adminLogin');

    cy.url().should('include', '/admin/users');
    cy.get('[data-testid="admin-user-item"]').should('contain', 'Jean Dupont');
    cy.get(`[data-testid="admin-view-user-${user.id}"]`).click();
    cy.wait('@getUserDetail');

    cy.get('[data-testid="admin-user-email"]').should('contain', user.email);
    cy.get('[data-testid="admin-user-city"]').should('contain', user.ville);
    cy.get('[data-testid="admin-delete-user"]').click();
    cy.wait('@deleteUser');
    cy.url().should('include', '/admin/users');
  });
});
