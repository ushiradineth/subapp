import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      (str) => process.env.VERCEL_URL ?? str,
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
  },

  client: {
    NEXT_PUBLIC_USER_ICON: z.string(),
    NEXT_PUBLIC_PRODUCT_LOGO: z.string(),
    NEXT_PUBLIC_PRODUCT_IMAGE: z.string(),
    NEXT_PUBLIC_GMAIL_ADDRESS: z.string()
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_USER_ICON: process.env.NEXT_PUBLIC_USER_ICON,
    NEXT_PUBLIC_PRODUCT_LOGO: process.env.NEXT_PUBLIC_PRODUCT_LOGO,
    NEXT_PUBLIC_PRODUCT_IMAGE: process.env.NEXT_PUBLIC_PRODUCT_IMAGE,
    NEXT_PUBLIC_GMAIL_ADDRESS: process.env.NEXT_PUBLIC_GMAIL_ADDRESS,
  },
});
