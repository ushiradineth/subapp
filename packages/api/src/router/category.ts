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

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.category.findMany({
      orderBy: { products: { _count: "desc" } },
      include: { _count: { select: { products: true } } },
    });
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.auth.id },
      data: {
        activity: {
          create: {
            category: { connect: { id: input.id } },
          },
        },
      },
    });

    return await ctx.prisma.category.findUnique({
      where: { id: input.id },
      include: {
        products: { select: { _count: { select: { subscriptions: true } }, name: true, id: true } },
        _count: { select: { products: true } },
      },
    });
  }),
});
