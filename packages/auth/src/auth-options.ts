import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@acme/db";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/

type UserRoles = "Admin" | "Vendor"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      role: UserRoles;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return Promise.resolve(token);
    },
    session({ session, token }) {
      if (token.user) {
        const t = token.user as {
          id: string;
          role: UserRoles;
        };

        session.user = {
          id: t.id,
          email: token.email,
          image: token.picture,
          name: token.name,
          role: t.role,
        };
      }
      return Promise.resolve(session);
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const vendor = await prisma.vendor.findUnique({
          where: { email: credentials?.email },
        });

        if (vendor) {
          const vendorVerified = bcrypt.compareSync(credentials?.password || "", vendor.password);

          if (vendorVerified) {
            return {
              id: vendor.id,
              email: vendor.email,
              name: vendor.name,
              image: vendor.image,
              role: "Vendor",
            };
          }
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials?.email },
        });

        if (admin) {
          const adminVerified = bcrypt.compareSync(credentials?.password || "", admin.password);

          if (adminVerified) {
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              image: admin.image,
              role: "Admin",
            };
          }
        }

        return null;
      },
    }),
  ],
};
