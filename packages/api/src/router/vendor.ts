import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const vendorRouter = createTRPCRouter({
  register: publicProcedure.input(z.object({ email: z.string(), password: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    const vendor = await ctx.prisma.vendor.findUnique({ where: { email: input.email } });

    if (vendor) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account already exists",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(input.password, salt);

    return ctx.prisma.vendor.create({ data: { name: input.name, email: input.email, password: hashedPassword, accountVerified: false } });
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.session.user.role === "Admin"
      ? await ctx.prisma.vendor.delete({ where: { id: input.id } })
      : new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Request",
        });
  }),
});
