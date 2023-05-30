import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { env } from "../../env.mjs";
import { deleteFiles } from "../lib/supabase";
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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

  update: protectedProcedure.input(z.object({ id: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    const vendor = await ctx.prisma.vendor.update({ where: { id: input.id }, data: { name: input.name } });

    if (!vendor) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account doesnt exists",
      });
    }

    return vendor;
  }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.vendor.delete({ where: { id: input.id } });

    await deleteFiles(env.USER_ICON, input.id);

    return user;
  }),
});
