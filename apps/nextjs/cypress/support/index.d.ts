/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainable {
    deleteTestUser(email: string): Chainable<void>;
  }
}
