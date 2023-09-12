// Importing env files here to validate on build
import "@acme/auth/env.mjs";
import "./src/env.mjs";
// @ts-ignore
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/api", "@acme/auth", "@acme/db"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {

    remotePatterns: [
      {
        protocol: "https",
        hostname: "subm-user-icons.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "subm-product-logos.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "subm-product-images.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "subm-category-icons.s3.ap-southeast-1.amazonaws.com",
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    return config
  },
};

export default config;
