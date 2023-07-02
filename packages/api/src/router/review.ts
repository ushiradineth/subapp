import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const reviewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ productId: z.string(), review: z.string(), rating: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({ where: { userId: ctx.auth.id, productId: input.productId } });

      if (reviews.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already has a review",
        });
      }

      return await ctx.prisma.review.create({
        data: {
          rating: input.rating,
          review: input.review,
          user: { connect: { id: ctx.auth.id } },
          product: { connect: { id: input.productId } },
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ reviewId: z.string(), review: z.string(), rating: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.review.update({
        where: { id: input.reviewId },
        data: {
          rating: input.rating,
          review: input.review,
          user: { connect: { id: ctx.auth.id } },
        },
      });
    }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.review.delete({
      where: { id: input.id },
    });
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.prisma.review.findUnique({
      where: { id: input.id },
      include: {
        user: true,
        likes: {
          where: {
            id: ctx.auth.id,
          },
        },
        dislikes: {
          where: {
            id: ctx.auth.id,
          },
        },
        comments: {
          include: {
            user: true,
            likes: {
              where: {
                id: ctx.auth.id,
              },
            },
            dislikes: {
              where: {
                id: ctx.auth.id,
              },
            },
            _count: {
              select: {
                likes: true,
                dislikes: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
            comments: true,
          },
        },
      },
    });
  }),

  getByProductId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.prisma.review.findMany({
      where: { product: { id: input.id } },
      include: {
        user: true,
        likes: {
          where: {
            id: ctx.auth.id,
          },
        },
        dislikes: {
          where: {
            id: ctx.auth.id,
          },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
            comments: true,
          },
        },
      },
    });
  }),

  like: protectedProcedure
    .input(z.object({ reviewId: z.string(), active: z.boolean(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const like = input.active ? { connect: { id: input.userId } } : { disconnect: { id: input.userId } };

      return await ctx.prisma.review.update({
        where: { id: input.reviewId },
        data: { likes: like },
        include: { user: true },
      });
    }),

  dislike: protectedProcedure
    .input(z.object({ reviewId: z.string(), active: z.boolean(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dislike = !input.active ? { connect: { id: input.userId } } : { disconnect: { id: input.userId } };

      return await ctx.prisma.review.update({
        where: { id: input.reviewId },
        data: { dislikes: dislike },
        include: { user: true },
      });
    }),
});
