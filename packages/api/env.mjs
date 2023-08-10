import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    USER_ICON: z.string(),
    PRODUCT_LOGO: z.string(),
    PRODUCT_IMAGE: z.string(),
    GMAIL_ADDRESS: z.string(),
    GMAIL_PASSWORD: z.string(),
    JWT_SECRET: z.string(),
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY_ID: z.string(),
  },
  client: {},
  runtimeEnv: {
    USER_ICON: process.env.NEXT_PUBLIC_USER_ICON,
    PRODUCT_LOGO: process.env.NEXT_PUBLIC_PRODUCT_LOGO,
    PRODUCT_IMAGE: process.env.NEXT_PUBLIC_PRODUCT_IMAGE,
    GMAIL_ADDRESS: process.env.GMAIL_ADDRESS,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    JWT_SECRET: process.env.NEXTAUTH_SECRET,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY_ID: process.env.AWS_SECRET_ACCESS_KEY_ID,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
