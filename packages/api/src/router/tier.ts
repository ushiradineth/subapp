import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const tierCreateValidation = z.object({
  name: z.string(),
  period: z.number(),
  price: z.number(),
  description: z.string().nullable(),
  link: z.string().nullable(),
});

export const tierRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({ tier: tierCreateValidation, productId: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.tier.create({
      data: {
        ...input.tier,
        product: { connect: { id: input.productId } },
      },
    });
  }),
});

