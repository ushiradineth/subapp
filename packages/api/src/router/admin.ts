import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  update: protectedProcedure.input(z.object({ id: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "Admin") {
      return new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized Request",
      });
    }

    const admin = await ctx.prisma.admin.update({ where: { id: input.id }, data: { name: input.name } });

    if (!admin) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account doesnt exists",
      });
    }

    return admin;
  }),
});
