import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  update: adminProcedure.input(z.object({ id: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
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
