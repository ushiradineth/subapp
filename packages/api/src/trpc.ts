import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerSession, type Session } from "@acme/auth";
import { prisma } from "@acme/db";

import { supabase } from "./lib/supabase";

type CreateContextOptions = {
  session: Session | null;
  auth: {
    id: string;
    role: string;
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

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  const session = await getServerSession({ req, res });

  return createInnerTRPCContext({
    session,
    auth: {
      id: req.headers.authorization ?? "",
      role: req.headers.authorization !== "" ? "User" : "",
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
        auth: { id: ctx.auth.id, role: ctx.auth.role },
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
