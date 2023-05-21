import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

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
    return ctx.session.user.role === "Admin"
      ? await ctx.prisma.user.delete({ where: { id: input.id } })
      : new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Request",
        });
  }),
});
