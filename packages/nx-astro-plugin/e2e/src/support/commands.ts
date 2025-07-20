// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to test Astro dev server
Cypress.Commands.add('checkAstroDevServer', () => {
  cy.request('http://localhost:4321').then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.include('html');
  });
});

// Custom command to test Astro build output
Cypress.Commands.add('checkAstroBuildOutput', () => {
  cy.visit('/');
  cy.get('html').should('exist');
  cy.get('body').should('exist');
});

// Custom command to test Astro preview server
Cypress.Commands.add('checkAstroPreviewServer', () => {
  cy.request('http://localhost:4322').then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.include('html');
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      checkAstroDevServer(): Chainable<void>;
      checkAstroBuildOutput(): Chainable<void>;
      checkAstroPreviewServer(): Chainable<void>;
    }
  }
}
