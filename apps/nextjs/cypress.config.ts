import { defineConfig } from "cypress";

import { env } from "~/env.mjs";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
  env: {
    BASE_URL: process.env.NEXTAUTH_URL,
  },

  e2e: {
    setupNodeEvents(on, config) {},
  },
});
