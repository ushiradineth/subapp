const email = "test@email.com";
const password = "Password@123";

describe("Register page", () => {
  it("Register form works", () => {
    cy.visit(`${Cypress.env("BASE_URL")}/auth?register=true`);

    cy.get("#name").type(email);
    cy.get("#email").type(email);
    cy.get("#password").type(password);
    cy.get("#confirmPassword").type(password);

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();

    cy.get("#\\31 ").then((el) => {
      if (el.text() === "Account already exists" || el.text() === "Account has been created") {
        cy.deleteTestUser(email);
      }
    });
  });

  it("Form gives proper errors", () => {
    cy.visit(`${Cypress.env("BASE_URL")}/auth?register=true`);

    cy.get("#name").type(email);

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();

    cy.get(".pb-2").contains(/Email is a required field/);

    cy.get("#email").type(email);

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();

    cy.get(".pb-2").contains(/Password is a required field/);

    cy.get("#password").type("password");

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();

    cy.get(".pb-2").contains(/Password must have atleast one Uppercase Character/);

    cy.get("#password").clear();

    cy.get("#password").type(password);
    cy.get("#confirmPassword").type(password);

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();

    cy.deleteTestUser(email);
  });
});
