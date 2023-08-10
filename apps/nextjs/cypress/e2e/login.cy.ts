describe("Login page", () => {
  beforeEach(() => cy.visit(`${Cypress.env("BASE_URL")}/auth`));

  it("Can login as admin user", () => {
    cy.get("#email").type(Cypress.env("ADMIN_EMAIL"));
    cy.get("#password").type(Cypress.env("ADMIN_PASSWORD"));

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();
  });

  it("Can login as vendor user", () => {
    cy.get("#email").type(Cypress.env("VENDOR_EMAIL"));
    cy.get("#password").type(Cypress.env("VENDOR_PASSWORD"));

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();
  });

  it("Form gives proper errors", () => {
    cy.get("#email").type("username@gmail.com");
    cy.get("#password").type("password");

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();

    cy.get(".pb-2").contains(/Password must have atleast one Uppercase Character/);

    cy.get("#password").clear();
    cy.get(".pb-2").contains(/Password is a required field/);

    cy.get("#password").type("Password@123");

    cy.get(".bg-card > .flex.items-center > .inline-flex").click();

    cy.get("#\\31").contains(/Incorrect Credentials/);
  });
});
