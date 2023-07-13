import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    USER_ICON: z.string(),
    PRODUCT_LOGO: z.string(),
    PRODUCT_IMAGE: z.string(),
    GMAIL_ADDRESS: z.string(),
    GMAIL_PASSWORD: z.string(),
    SUPABASE_URL: z.string(),
    JWT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_PROJECT: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },
  runtimeEnv: {
    USER_ICON: process.env.NEXT_PUBLIC_USER_ICON,
    PRODUCT_LOGO: process.env.NEXT_PUBLIC_PRODUCT_LOGO,
    PRODUCT_IMAGE: process.env.NEXT_PUBLIC_PRODUCT_IMAGE,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PROJECT: process.env.NEXT_PUBLIC_SUPABASE_PROJECT,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GMAIL_ADDRESS: process.env.GMAIL_ADDRESS,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD, 
    JWT_SECRET: process.env.NEXTAUTH_SECRET,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
