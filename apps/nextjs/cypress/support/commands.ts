Cypress.Commands.add("deleteTestUser", (email) => {
  cy.visit(`${Cypress.env("BASE_URL")}/auth`);

  cy.get("#email").type(Cypress.env("ADMIN_EMAIL"));
  cy.get("#password").type(Cypress.env("ADMIN_PASSWORD"));

  cy.intercept("/api/auth/session").as("login");
  cy.get(".bg-card > .flex.items-center > .inline-flex").click();
  cy.wait("@login").then(() => {
    cy.visit(`${Cypress.env("BASE_URL")}/vendor?search=${email}`);

    cy.get(":nth-child(5) > .flex").children().first().click();

    cy.get(".bg-primary > button").click();
  });
});
