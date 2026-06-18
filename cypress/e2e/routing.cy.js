describe('Routage SPA', () => {
  beforeEach(() => {
    cy.mockUsersApi([]);
  });

  const managedRoutes = [
    { path: '/', testId: 'home-page' },
    { path: '/register', testId: 'registration-page' },
    { path: '/list', testId: 'list-page' },
    { path: '/admin/login', testId: 'admin-login-page' }
  ];

  managedRoutes.forEach(({ path, testId }) => {
    it(`charge ${path} en URL directe`, () => {
      cy.visit(path);
      cy.wait('@getUsers');
      cy.get(`[data-testid="${testId}"]`).should('be.visible');
    });
  });

  it('affiche une page 404 pour une route inconnue', () => {
    cy.visit('/route-inexistante');
    cy.get('[data-testid="not-found-page"]').should('be.visible');
    cy.get('[data-testid="not-found-page"]').should('contain', 'Page introuvable');
    cy.get('[data-testid="go-to-home-from-404"]').click();
    cy.assertHomePage();
  });

  it('affiche une page 404 pour un chemin admin incomplet', () => {
    cy.visit('/admin');
    cy.get('[data-testid="not-found-page"]').should('be.visible');
  });
});
