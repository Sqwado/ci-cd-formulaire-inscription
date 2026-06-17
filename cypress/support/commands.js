const validUser = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@email.com',
  dateOfBirth: '1990-01-01',
  ville: 'Paris',
  codePostal: '75001'
};

Cypress.Commands.add('visitHomeWithRegistrations', (registrations = []) => {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.clear();
      if (registrations.length > 0) {
        win.localStorage.setItem('registrations', JSON.stringify(registrations));
      }
    }
  });
});

Cypress.Commands.add('goToRegistrationForm', () => {
  cy.get('[data-testid="go-to-registration"]').click();
  cy.url().should('include', '/register');
});

Cypress.Commands.add('fillValidRegistrationForm', () => {
  cy.get('[data-testid="nom"]').type(validUser.nom);
  cy.get('[data-testid="prenom"]').type(validUser.prenom);
  cy.get('[data-testid="email"]').type(validUser.email);
  cy.get('[data-testid="dateDeNaissance"]').type(validUser.dateOfBirth);
  cy.get('[data-testid="ville"]').type(validUser.ville);
  cy.get('[data-testid="codePostal"]').type(validUser.codePostal);
});

Cypress.Commands.add('fillInvalidRegistrationForm', () => {
  cy.get('[data-testid="nom"]').type('Dupont');
  cy.get('[data-testid="prenom"]').type('Jean');
  cy.get('[data-testid="email"]').type('email-invalide');
  cy.get('[data-testid="dateDeNaissance"]').type('2009-01-01');
  cy.get('[data-testid="ville"]').type('Paris9');
  cy.get('[data-testid="codePostal"]').type('7500');
});

Cypress.Commands.add('goToHome', () => {
  cy.get('[data-testid="go-to-home"]').click();
  const baseUrl = Cypress.config().baseUrl.replace(/\/$/, '');
  cy.url().should('match', new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
});

Cypress.Commands.add('assertRegisteredUsersCount', (count) => {
  cy.get('[data-testid="users-count"]').should('have.text', String(count));
  cy.get('[data-testid="users-registration-message"]').should(
    'contain',
    'utilisateur(s) déjà inscrit(s)'
  );
});
