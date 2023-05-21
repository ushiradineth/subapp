import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const productRouter = createTRPCRouter({
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.session.user.role === "Admin"
      ? await ctx.prisma.product.delete({ where: { id: input.id } })
      : new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Request",
        });
  }),
});
