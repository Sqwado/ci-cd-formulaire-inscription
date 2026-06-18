const toApiUsers = (registrations) =>
  registrations.map((registration, index) => ({
    id: index + 1,
    prenom: registration.prenom,
    nom: registration.nom
  }));

Cypress.Commands.add('mockUsersApi', (registrations = []) => {
  let remoteUsers = toApiUsers(registrations);

  cy.intercept('GET', '**/users', (req) => {
    req.reply({ statusCode: 200, body: { users: remoteUsers } });
  }).as('getUsers');

  cy.intercept('POST', '**/users', (req) => {
    remoteUsers = [
      ...remoteUsers,
      {
        id: remoteUsers.length + 1,
        ...req.body
      }
    ];

    req.reply({
      statusCode: 201,
      body: { id: remoteUsers.length, ...req.body }
    });
  }).as('createUser');
});

Cypress.Commands.add('mockUsersApiGetError', (statusCode = 503, message = 'API indisponible') => {
  cy.intercept('GET', '**/users', {
    statusCode,
    body: { detail: message }
  }).as('getUsersError');
});

Cypress.Commands.add('mockUsersApiPostError', (statusCode = 500, message = 'Erreur serveur') => {
  cy.intercept('POST', '**/users', {
    statusCode,
    body: { detail: message }
  }).as('createUserError');
});

Cypress.Commands.add('visitHomeWithRegistrations', (registrations = []) => {
  cy.mockUsersApi(registrations);
  cy.visit('/');
});

Cypress.Commands.add('visitHomeDocker', () => {
  cy.visit('/');
});

Cypress.Commands.add('visitHomeOffline', () => {
  cy.visit('/');
});

Cypress.Commands.add('visitListWithRegistrations', (registrations = []) => {
  cy.visitHomeWithRegistrations(registrations);
  cy.wait('@getUsers');
  cy.goToList();
  cy.wait('@getUsers');
});

Cypress.Commands.add('assertHomePage', () => {
  cy.get('[data-testid="home-page"]').should('be.visible');
  cy.contains('h1', 'Bienvenue').should('be.visible');
  cy.get('[data-testid="go-to-registration"]').should('be.visible');
  cy.get('[data-testid="go-to-list"]').should('be.visible');
});

Cypress.Commands.add('goToRegistrationForm', () => {
  cy.get('[data-testid="go-to-registration"]').click();
  cy.url().should('include', '/register');
  cy.get('[data-testid="registration-page"]').should('be.visible');
});

Cypress.Commands.add('goToList', () => {
  cy.get('[data-testid="go-to-list"]').click();
  cy.url().should('include', '/list');
  cy.get('[data-testid="list-page"]').should('be.visible');
});

Cypress.Commands.add('fillRegistrationForm', (user) => {
  cy.get('[data-testid="nom"]').clear().type(user.nom);
  cy.get('[data-testid="prenom"]').clear().type(user.prenom);
  cy.get('[data-testid="email"]').clear().type(user.email);
  cy.get('[data-testid="dateDeNaissance"]').clear().type(user.dateOfBirth);
  cy.get('[data-testid="ville"]').clear().type(user.ville);
  cy.get('[data-testid="codePostal"]').clear().type(user.codePostal);
});

Cypress.Commands.add('fillValidRegistrationForm', () => {
  cy.fixture('users').then(({ validUser }) => {
    cy.fillRegistrationForm(validUser);
  });
});

Cypress.Commands.add('fillInvalidRegistrationForm', () => {
  cy.fixture('users').then(({ invalidUser }) => {
    cy.fillRegistrationForm(invalidUser);
  });
});

Cypress.Commands.add('submitRegistrationForm', () => {
  cy.get('[data-testid="submit"]').click();
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

Cypress.Commands.add('assertRegistrationListCount', (count) => {
  if (count === 0) {
    cy.get('[data-testid="no-registrations"]').should('be.visible');
    cy.get('[data-testid="registration-item"]').should('not.exist');
    return;
  }

  cy.get('[data-testid="no-registrations"]').should('not.exist');
  cy.get('[data-testid="registration-item"]').should('have.length', count);
});

Cypress.Commands.add('prepareOfflineRegistration', () => {
  cy.fixture('users').then(({ validUser }) => {
    cy.visit('/');
    cy.goToRegistrationForm();
    cy.fillRegistrationForm(validUser);
    cy.submitRegistrationForm();
    cy.url().should('include', '/list');
  });
});

Cypress.Commands.add('assertRegistrationVisible', (user) => {
  cy.get('[data-testid="registration-item"]')
    .contains(`${user.prenom} ${user.nom}`)
    .should('be.visible');
});

Cypress.Commands.add('assertHighlightedRegistration', () => {
  cy.get('[data-testid="registration-item"].registration-item-highlight').should('exist');
});

Cypress.Commands.add('assertCreateUserPayload', (expectedUser) => {
  cy.wait('@createUser').then(({ request }) => {
    expect(request.body).to.deep.equal({
      prenom: expectedUser.prenom,
      nom: expectedUser.nom,
      email: expectedUser.email,
      dateOfBirth: expectedUser.dateOfBirth,
      ville: expectedUser.ville,
      codePostal: expectedUser.codePostal
    });
  });
});
