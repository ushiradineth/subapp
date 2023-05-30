import { z } from "zod";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({ name: z.string(), description: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.category.create({
      data: {
        name: input.name,
        description: input.description,
      },
    });
  }),

  update: adminProcedure.input(z.object({ id: z.string(), name: z.string(), description: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.category.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
      },
    });
  }),
});
