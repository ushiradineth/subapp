import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const templateCreateValidation = z.object({
  name: z.string(),
  description: z.string(),
  link: z.string().nullable(),
  price: z.number(),
  period: z.number(),
});

export const templateRouter = createTRPCRouter({
  create: protectedProcedure.input(templateCreateValidation).mutation(async ({ ctx, input }) => {
    const template = await ctx.prisma.template.create({
      data: {
        name: input.name,
        description: input.description,
        link: input.link,
        user: { connect: { id: ctx.auth.id } },
      },
    });

    const subscription = await ctx.prisma.subscription.create({
      data: {
        template: { connect: { id: template.id } },
        user: { connect: { id: ctx.auth.id } },
        tier: {
          create: {
            period: input.period,
            price: input.price,
            template: { connect: { id: template.id } },
            name: input.name,
            description: input.description,
          },
        },
      },
    });

    return { template, subscription };
  }),
});
