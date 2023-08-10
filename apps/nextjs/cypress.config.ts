import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  env: {
    BASE_URL: process.env.NEXTAUTH_URL,
    ADMIN_EMAIL: process.env.CY_TEST_ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.CY_TEST_ADMIN_PASSWORD,
    VENDOR_EMAIL: process.env.CY_TEST_VENDOR_EMAIL,
    VENDOR_PASSWORD: process.env.CY_TEST_VENDOR_PASSWORD,
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
