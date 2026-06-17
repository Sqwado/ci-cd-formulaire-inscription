const validUser = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@email.com',
  dateOfBirth: '1990-01-01',
  ville: 'Paris',
  codePostal: '75001'
};

const toApiUsers = (registrations) =>
  registrations.map((registration, index) => ({
    id: index + 1,
    name: `${registration.prenom} ${registration.nom}`,
    email: registration.email,
    address: {
      city: registration.ville,
      zipcode: registration.codePostal
    }
  }));

Cypress.Commands.add('mockUsersApi', (registrations = []) => {
  let remoteUsers = toApiUsers(registrations);

  cy.intercept('GET', '**/users', (req) => {
    req.reply({ statusCode: 200, body: remoteUsers });
  }).as('getUsers');

  cy.intercept('POST', '**/users', (req) => {
    remoteUsers = [
      ...remoteUsers,
      {
        id: remoteUsers.length + 1,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address
      }
    ];

    req.reply({
      statusCode: 201,
      body: { id: remoteUsers.length }
    });
  }).as('createUser');
});

Cypress.Commands.add('visitHomeWithRegistrations', (registrations = []) => {
  cy.mockUsersApi(registrations);
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.clear();
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
