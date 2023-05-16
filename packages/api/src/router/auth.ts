import bcrypt from "bcryptjs";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  register: publicProcedure.input(z.object({ email: z.string(), password: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });

    if (user) {
      return null;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(input.password, salt);

    return ctx.prisma.user.create({ data: { email: input.email, password: hashedPassword } });
  }),

  authorize: publicProcedure.input(z.object({ email: z.string(), password: z.string() })).mutation(async ({ ctx, input }) => {
    const user: { email: string, password: string} | null = await ctx.prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      return null;
    }

    const auth = bcrypt.compareSync(input.password, user.password);

    if (auth) {
      return user;
    } else {
      return null;
    }
  }),
});
