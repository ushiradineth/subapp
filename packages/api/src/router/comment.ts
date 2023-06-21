import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({ reviewId: z.string(), comment: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.comment.create({
      data: {
        comment: input.comment,
        user: { connect: { id: ctx.auth.id } },
        review: { connect: { id: input.reviewId } },
      },
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
    });
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.comment.delete({
      where: { id: input.id },
    });
  }),

  like: protectedProcedure
    .input(z.object({ commentId: z.string(), active: z.boolean(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const like = input.active ? { connect: { id: input.userId } } : { disconnect: { id: input.userId } };

      return await ctx.prisma.comment.update({
        where: { id: input.commentId },
        data: { likes: like },
        include: { user: true },
      });
    }),

  dislike: protectedProcedure
    .input(z.object({ commentId: z.string(), active: z.boolean(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dislike = !input.active ? { connect: { id: input.userId } } : { disconnect: { id: input.userId } };

      return await ctx.prisma.comment.update({
        where: { id: input.commentId },
        data: { dislikes: dislike },
        include: { user: true },
      });
    }),
});
