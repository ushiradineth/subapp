import { z } from "zod";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  create: adminProcedure.input(z.object({ name: z.string(), description: z.string() })).mutation(async ({ ctx, input }) => {
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
      include: { _count: { select: { products: true } }, products: { select: { verified: true } } },
    });
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.prisma.category.findUnique({
      where: { id: input.id },
      include: {
        products: { select: { _count: { select: { subscriptions: true } }, name: true, id: true } },
        _count: { select: { products: true } },
      },
    });
  }),

  categoryVisit: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    let activity = await ctx.prisma.visitActivity.findFirst({
      where: {
        userId: ctx.auth.id,
        categoryId: input.id,
      },
    });

    if (!activity) {
      activity = await ctx.prisma.visitActivity.create({
        data: {
          user: { connect: { id: ctx.auth.id } },
          category: { connect: { id: input.id } },
          timestamps: {
            create: {
              createdAt: new Date(),
            },
          },
        },
      });
    }

    await ctx.prisma.timestamp.create({
      data: {
        createdAt: new Date(),
        visitActivity: {
          connect: {
            id: activity.id,
          },
        },
      },
    });
  }),
});
