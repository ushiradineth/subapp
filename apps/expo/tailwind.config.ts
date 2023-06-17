import { type Config } from "tailwindcss";

import baseConfig from "@acme/tailwind-config";

export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [
    baseConfig,
    {
      content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
      theme: {
        extend: {
          colors: {
            accent: "#5D76CC",
            background: "#D9D9D9",
            foreground: "#777777",
          },
        },
      },
    },
  ],
} satisfies Config;
