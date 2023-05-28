import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "../../env.mjs";
import { deleteFiles } from "../lib/supabase";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const productCreateValidation = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
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
        vendor: { connect: { email: ctx.session.user.role === "Admin" ? "subm@subm.com" : ctx.session.user.email || "" } },
        category: { connect: { id: input.category } },
      },
    });

    return product;
  }),

  verify: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "Admin") {
      return new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized Request",
      });
    }

    const product = await ctx.prisma.product.update({ where: { id: input.id }, data: { verified: true } });

    return product;
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "Admin") {
      return new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized Request",
      });
    }

    const product = await ctx.prisma.product.delete({ where: { id: input.id } });

    await deleteFiles(env.PRODUCT_IMAGE, input.id);
    await deleteFiles(env.PRODUCT_LOGO, input.id);

    return product;
  }),
});
