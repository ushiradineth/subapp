import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { tierRouter } from "./tier";

const tierCreateValidation = z.object({
  name: z.string(),
  period: z.number(),
  price: z.number(),
  description: z.string().nullable(),
  link: z.string().nullable(),
});

const productCreateValidation = z.object({
  name: z.string(),
  description: z.string(),
  tiers: tierCreateValidation.array().nullish(),
  link: z.string().nullable(),
});

export const productRouter = createTRPCRouter({
  create: protectedProcedure.input(productCreateValidation).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        link: input.link,
        verified: Boolean(ctx.session.user.role === "Admin"),
        vendorId: ctx.session.user.role === "Admin" ? "clhz76lha0008vgggn3j8l37q" : ctx.session.user.id,
        userId: "",
      },
    });

    const tierCaller = tierRouter.createCaller({ ...ctx });

    input.tiers?.forEach(async (tier) => {
      await tierCaller.create({ tier: tier, productId: product.id });
    });

    return product;
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.session.user.role === "Admin"
      ? await ctx.prisma.product.delete({ where: { id: input.id } })
      : new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Request",
        });
  }),
});
