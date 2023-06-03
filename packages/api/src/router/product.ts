import { z } from "zod";

import { env } from "../../env.mjs";
import { deleteFiles } from "../lib/supabase";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

const productCreateValidation = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  link: z.string().nullable(),
});

const productUpdateValidation = z.object({
  id: z.string(),
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

  update: adminProcedure.input(productUpdateValidation).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        link: input.link,
        category: { connect: { id: input.category } },
      },
    });

    return product;
  }),

  verify: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.update({ where: { id: input.id }, data: { verified: true } });

    return product;
  }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.delete({ where: { id: input.id } });

    await deleteFiles(env.PRODUCT_IMAGE, input.id);
    await deleteFiles(env.PRODUCT_LOGO, input.id);

    return product;
  }),
});
