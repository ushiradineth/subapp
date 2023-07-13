import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import * as jwt from "jsonwebtoken";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerSession, type Session } from "@acme/auth";
import { prisma } from "@acme/db";

import { env } from "../env.mjs";
import { supabase } from "./lib/supabase";

type CreateContextOptions = {
  session: Session | null;
  auth: {
    id: string;
  };
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
    supabase,
    auth: opts.auth,
  };
};

type JWT = {
  id: string;
  email: string;
  name: string;
  iat: number;
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerSession({ req, res });
  let userId = "";

  if (req.headers.authorization && !session) {
    try {
      const decodedJwt = jwt.verify(req.headers.authorization, env.JWT_SECRET) as JWT;
      userId = decodedJwt.id;
    } catch (err) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Token is invalid or expired",
      });
    }
  }

  return createInnerTRPCContext({
    session,
    auth: {
      id: userId,
    },
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user && !ctx.auth.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.auth.id) {
    return next({
      ctx: {
        auth: { id: ctx.auth.id },
      },
    });
  }

  if (ctx.session?.user) {
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  }

  return next({
    ctx: {},
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "Admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized Request",
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
