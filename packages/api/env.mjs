import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    USER_ICON: z.string(),
    PRODUCT_LOGO: z.string(),
    PRODUCT_IMAGE: z.string(),
    SUPABASE_PROJECT: z.string(),
    SUPABASE_ANON_KEY: z.string(),
  },
  client: {},
  runtimeEnv: {
    USER_ICON: process.env.NEXT_PUBLIC_USER_ICON,
    PRODUCT_LOGO: process.env.NEXT_PUBLIC_PRODUCT_LOGO,
    PRODUCT_IMAGE: process.env.NEXT_PUBLIC_PRODUCT_IMAGE,
    SUPABASE_PROJECT: process.env.SUPABASE_PROJECT,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
