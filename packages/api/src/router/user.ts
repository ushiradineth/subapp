import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { env } from "../../env.mjs";
import { deleteFiles } from "../lib/supabase";
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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

  update: protectedProcedure.input(z.object({ id: z.string(), name: z.string(), password: z.string() })).mutation(async ({ ctx, input }) => {
    const data: { name?: string; password?: string } = { name: input.name };

    if (input.password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(input.password, salt);
      data.password = hashedPassword;
    }

    const user = await ctx.prisma.user.update({ where: { id: input.id }, data });

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account doesnt exists",
      });
    }

    return user;
  }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.delete({ where: { id: input.id } });

    await deleteFiles(env.USER_ICON, input.id);

    return user;
  }),
});
