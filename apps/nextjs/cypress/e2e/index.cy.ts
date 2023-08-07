describe("Landing page", () => {
  beforeEach(() => cy.visit(Cypress.env("BASE_URL")));

  it("has title", () => {
    cy.get(".text-4xl").contains(/The Platform to enrich your subscription business/);
    cy.get(".mt-10 > .rounded-md").click({ force: true });
    cy.url().should("include", "/auth?register=true");
  });

  it("has get started button", () => {
    cy.get(".mt-10 > .rounded-md")
      .contains(/Get started/)
      .click({ force: true });
    cy.url().should("include", "/auth?register=true");
  });

  it("has join us button", () => {
    cy.get(".inline-flex")
      .contains(/Join Us/)
      .click();
    cy.url().should("include", "/auth");
  });

  it("has join us 2 button", () => {
    cy.get(".mt-4")
      .contains(/Join us/)
      .click({ force: true });
    cy.url().should("include", "/auth?register=true");
  });
});
