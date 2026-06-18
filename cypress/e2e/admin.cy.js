describe('Administration', () => {
  const apiBase = () =>
    (cy.env('REACT_APP_API_URL') || 'http://localhost:8000').replace(/\/$/, '');

  beforeEach(() => {
    cy.mockUsersApi([]);
    cy.intercept('POST', `${apiBase()}/auth/login`, {
      statusCode: 200,
      body: { token: 'test-admin-token', email: 'loise.fenoll@ynov.com' }
    }).as('adminLogin');
  });

  it('redirige vers le login si un visiteur accede a /admin/users', () => {
    cy.visit('/admin/users');
    cy.url().should('include', '/admin/login');
    cy.get('[data-testid="admin-login-page"]').should('be.visible');
  });

  it('charge la page de connexion via une URL directe', () => {
    cy.visit('/admin/login');
    cy.get('[data-testid="admin-login-page"]').should('be.visible');
    cy.get('[data-testid="admin-login-form"]').should('be.visible');
  });

  it('affiche une erreur si les identifiants sont invalides', () => {
    cy.intercept('POST', `${apiBase()}/auth/login`, {
      statusCode: 401,
      body: { detail: 'Invalid credentials' }
    }).as('adminLoginError');

    cy.visit('/admin/login');
    cy.get('[data-testid="admin-email"]').type('wrong@ynov.com');
    cy.get('[data-testid="admin-password"]').type('wrong-password');
    cy.get('[data-testid="admin-login-submit"]').click();
    cy.wait('@adminLoginError');
    cy.get('[data-testid="error-toast"]').should('contain', 'Invalid credentials');
    cy.url().should('include', '/admin/login');
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

    const api = apiBase();

    cy.intercept('GET', `${api}/users`, {
      statusCode: 200,
      body: { users: [{ id: user.id, prenom: user.prenom, nom: user.nom }] }
    }).as('getUsers');

    cy.intercept('GET', `${api}/users/${user.id}`, {
      statusCode: 200,
      body: user
    }).as('getUserDetail');

    cy.intercept('DELETE', `${api}/users/${user.id}`, {
      statusCode: 204
    }).as('deleteUser');

    cy.visit('/');
    cy.get('[data-testid="go-to-admin-login"]').click();
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

  it('permet de se deconnecter depuis la liste admin', () => {
    const api = apiBase();

    cy.intercept('GET', `${api}/users`, {
      statusCode: 200,
      body: { users: [] }
    }).as('getUsers');

    cy.visit('/admin/login');
    cy.get('[data-testid="admin-email"]').type('loise.fenoll@ynov.com');
    cy.get('[data-testid="admin-password"]').type('PvdrTAzTeR247sDnAZBr');
    cy.get('[data-testid="admin-login-submit"]').click();
    cy.wait('@adminLogin');
    cy.get('[data-testid="admin-users-page"]').should('be.visible');

    cy.get('[data-testid="admin-logout"]').click();
    cy.url().should('include', '/admin/login');
    cy.get('[data-testid="admin-login-page"]').should('be.visible');
  });
});
