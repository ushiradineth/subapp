import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { env } from "../../env.mjs";
import { deleteFile } from "../lib/supabase";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  register: publicProcedure.input(z.object({ email: z.string(), password: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });

    if (user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account already exists",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(input.password, salt);

    return ctx.prisma.user.create({ data: { name: input.name, email: input.email, password: hashedPassword } });
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "Admin") {
      return new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized Request",
      });
    }

    const user = await ctx.prisma.user.delete({ where: { id: input.id } });

    await deleteFile(env.USER_ICON, input.id);

    return user;
  }),
});
