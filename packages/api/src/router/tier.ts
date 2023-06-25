import { z } from "zod";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

const tierCreateValidation = z.object({
  name: z.string(),
  period: z.number(),
  price: z.number(),
  description: z.string(),
  points: z.array(z.string()),
  productId: z.string(),
});

const tierUpdateValidation = z.object({
  id: z.string(),
  name: z.string(),
  period: z.number(),
  price: z.number(),
  description: z.string(),
  points: z.array(z.string()),
});

export const tierRouter = createTRPCRouter({
  create: protectedProcedure.input(tierCreateValidation).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.tier.create({
      data: {
        name: input.name,
        period: input.period,
        price: input.price,
        description: input.description,
        points: input.points,
        product: { connect: { id: input.productId } },
      },
    });
  }),

  update: adminProcedure.input(tierUpdateValidation).mutation(async ({ ctx, input }) => {
    const tier = await ctx.prisma.tier.update({
      where: { id: input.id },
      data: {
        name: input.name,
        period: input.period,
        price: input.price,
        description: input.description,
        points: input.points,
      },
    });

    return tier;
  }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const tier = await ctx.prisma.tier.delete({ where: { id: input.id } });

    return tier;
  }),

  getByProductId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.prisma.tier.findMany({ where: { product: { id: input.id } } });
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.prisma.tier.findUnique({ where: { id: input.id } });
  }),
});
