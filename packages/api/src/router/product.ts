import { z } from "zod";

import { env } from "../../env.mjs";
import { deleteFiles, supabase } from "../lib/supabase";
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
        verified: Boolean(ctx.session?.user.role === "Admin"),
        vendor: { connect: { email: ctx.session?.user.role === "Admin" ? env.GMAIL_ADDRESS : ctx.session?.user.email || "" } },
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

  getHomeFeed: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.product.findMany({ include: { category: { select: { name: true } } } });
  }),

  getProductPage: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const products = await ctx.prisma.product.findMany({
      orderBy: { subscriptions: { _count: "desc" } },
      select: { id: true },
    });

    const product = await ctx.prisma.product.findUniqueOrThrow({
      where: { id: input.id },
      include: {
        category: true,
        _count: {
          select: { subscriptions: true, reviews: true },
        },
        reviews: {
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
          orderBy: { rating: "desc" },
        },
      },
    });

    const rank = products.findIndex((e) => e.id === input.id) + 1;

    const rating = (product?.reviews?.reduce((acc, review) => acc + review.rating, 0) ?? 0) / (product?.reviews?.length ?? 1);

    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.auth.id },
      select: {
        wishlist: {
          where: {
            id: product?.id,
          },
        },
        reviews: {
          where: {
            productId: product?.id,
          },
        },
        subscriptions: {
          where: {
            productId: product?.id,
            active: true,
          },
        },
      },
    });

    const { data: imageList } = await supabase.storage.from(env.PRODUCT_IMAGE).list(product?.id);

    const images: { url: string }[] = [];

    imageList?.forEach((image) => {
      const { data: url } = supabase.storage.from(env.PRODUCT_IMAGE).getPublicUrl(`${product?.id}/${image.name}`);
      images.push({ url: url?.publicUrl ?? "" });
    });

    await ctx.prisma.user.update({
      where: { id: ctx.auth.id },
      data: {
        activity: {
          create: {
            product: { connect: { id: input.id } },
          },
        },
      },
    });

    return {
      product,
      rank: rank ?? 0,
      rating: rating ?? 0,
      wishlisted: (user?.wishlist?.length || 0) > 0,
      review: user?.reviews,
      subscribed: (user?.subscriptions?.length || 0) > 0,
      logo: `${env.SUPABASE_URL}/${env.PRODUCT_LOGO}/${product?.id}/0.jpg`,
      images,
    };
  }),

  wishlist: protectedProcedure.input(z.object({ id: z.string(), wishlist: z.boolean() })).mutation(async ({ ctx, input }) => {
    const action = input.wishlist ? { connect: { id: input.id } } : { disconnect: { id: input.id } };

    return await ctx.prisma.user.update({ where: { id: ctx.auth.id }, data: { wishlist: action } });
  }),

  search: protectedProcedure.input(z.object({ keys: z.string() })).mutation(async ({ ctx, input }) => {
    const keywords = input.keys.split(" ").join(" | ");

    return await ctx.prisma.product.findMany({
      where: {
        OR: [
          { name: { search: keywords } },
          {
            category: { OR: [{ name: { search: keywords } }, { description: { search: keywords } }] },
          },
          { vendor: { name: { search: keywords } } },
        ],
      },
      include: {
        vendor: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        subscriptions: {
          where: {
            active: true,
            userId: ctx.auth.id,
          },
        },
      },
    });
  }),

  productVisit: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    let activity = await ctx.prisma.visitActivity.findFirst({
      where: {
        userId: ctx.auth.id,
        productId: input.id,
      },
    });

    if (!activity) {
      activity = await ctx.prisma.visitActivity.create({
        data: {
          user: { connect: { id: ctx.auth.id } },
          product: { connect: { id: input.id } },
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
