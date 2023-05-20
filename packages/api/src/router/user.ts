import bcrypt from "bcryptjs";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  register: publicProcedure.input(z.object({ email: z.string(), password: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });

    if (user) {
      return null;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(input.password, salt);

    return ctx.prisma.user.create({ data: { name: input.name, email: input.email, password: hashedPassword } });
  }),
});
