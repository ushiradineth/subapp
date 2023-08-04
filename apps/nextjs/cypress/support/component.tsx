import "@/styles/globals.css";
import { mount } from "cypress/react18";

import "./commands";

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", (component, options) => {
  const wrapped = <>{component}</>;
  return mount(wrapped, options);
});
