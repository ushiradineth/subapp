import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const subscriptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ productId: z.string(), tierId: z.string(), startedAt: z.date() }))
    .mutation(async ({ ctx, input }) => {
      const subscriptions = await ctx.prisma.subscription.findMany({
        where: { userId: ctx.auth.id, productId: input.productId, tierId: input.tierId, active: true },
      });

      if (subscriptions.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has already subscribed",
        });
      }

      const user = await ctx.prisma.user.findFirst({ where: { id: ctx.auth.id }, include: { wishlist: true } });

      if (user?.wishlist.find((product) => product.id === input.productId)) {
        await ctx.prisma.user.update({ where: { id: ctx.auth.id }, data: { wishlist: { disconnect: { id: input.productId } } } });
      }

      return await ctx.prisma.subscription.create({
        data: {
          active: true,
          startedAt: input.startedAt,
          user: { connect: { id: ctx.auth.id } },
          product: { connect: { id: input.productId } },
          tier: { connect: { id: input.tierId } },
        },
      });
    }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.subscription.update({ data: { active: false, deletedAt: new Date() }, where: { id: input.id } });
  }),

  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.subscription.findMany({ where: { user: { id: ctx.auth.id } } });
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.prisma.subscription.findFirst({
      where: { id: input.id },
      include: {
        tier: {
          select: {
            name: true,
            price: true,
            period: true,
            product: { select: { name: true, vendor: { select: { name: true } }, category: { select: { name: true } } } },
            template: { select: { name: true, link: true } },
          },
        },
      },
    });
  }),
});
