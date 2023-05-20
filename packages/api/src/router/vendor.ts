import bcrypt from "bcryptjs";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const vendorRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  register: publicProcedure.input(z.object({ email: z.string(), password: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    const vendor = await ctx.prisma.vendor.findUnique({ where: { email: input.email } });

    if (vendor) {
      return null;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(input.password, salt);

    return ctx.prisma.vendor.create({ data: { name: input.name, email: input.email, password: hashedPassword, accountVerified: false } });
  }),
});
