import moment from "moment";
import { z } from "zod";

import { type Product } from "@acme/db";

import { env } from "../../env.mjs";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { s3Router } from "./s3";

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

interface ForYouProduct extends Product {
  category: {
    name: string;
  };
}

interface ForYouCategory {
  categoryId: string;
  products: ForYouProduct[];
}

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

  updateImages: protectedProcedure.input(z.object({ id: z.string(), images: z.array(z.string()) })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.product.update({
      where: { id: input.id },
      data: {
        images: {
          set: [...input.images],
        },
      },
    });
  }),

  deleteImage: protectedProcedure.input(z.object({ id: z.string(), image: z.string() })).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({ where: { id: input.id } });
    return await ctx.prisma.product.update({
      where: { id: input.id },
      data: {
        images: {
          set: product?.images.filter((image) => image !== input.image) || [],
        },
      },
    });
  }),

  verify: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.update({ where: { id: input.id }, data: { verified: true } });

    return product;
  }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.delete({ where: { id: input.id } });

    const s3 = s3Router.createCaller({ ...ctx });
    await s3.deleteObject({ bucket: env.PRODUCT_LOGO, fileName: `${input.id}.jpg` });
    await s3.deleteFolder({ bucket: env.PRODUCT_IMAGE, folderName: input.id });

    return product;
  }),

  getHomeFeed: protectedProcedure.query(async ({ ctx }) => {
    const activity = await ctx.prisma.timestamp.findMany({
      where: {
        visitActivity: {
          userId: ctx.auth.id,
        },
        createdAt: { gte: moment().subtract(7, "d").toDate() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        visitActivity: {
          select: {
            productId: true,
            categoryId: true,
          },
        },
      },
    });

    const visitedProducts: { [key: string]: number } = {};
    const visitedCategories: { [key: string]: number } = {};

    for (const num of activity) {
      if (num.visitActivity.productId) {
        const productId = num.visitActivity.productId;
        visitedProducts[productId] = visitedProducts[productId] ? Number(visitedProducts[productId]) + 1 : 1;
      }

      if (num.visitActivity.categoryId) {
        const categoryId = num.visitActivity.categoryId;
        visitedCategories[categoryId] = visitedCategories[categoryId] ? Number(visitedCategories[categoryId]) + 1 : 1;
      }
    }

    const forYouProducts: ForYouProduct[] = [];

    if (Object.keys(visitedProducts).length < 5) {
      forYouProducts.push(
        ...(await ctx.prisma.product.findMany({
          where: {
            id: {
              notIn: [...Object.keys(visitedProducts)],
            },
            subscriptions: {
              none: {
                userId: ctx.auth.id,
              },
            },
            verified: true,
          },
          take: 10,
          include: { category: { select: { name: true } } },
        })),
      );
    }

    forYouProducts.push(
      ...(await ctx.prisma.product.findMany({
        where: {
          id: {
            in: [...Object.keys(visitedProducts)],
          },
          subscriptions: {
            none: {
              userId: ctx.auth.id,
            },
          },
          verified: true,
        },
        take: 10,
        include: { category: { select: { name: true } } },
      })),
    );

    forYouProducts.sort(() => Math.random() - 0.5);

    const trendingProducts = await ctx.prisma.product.findMany({
      where: {
        verified: true,
        subscriptions: {
          some: {
            createdAt: { gte: moment().subtract(7, "d").toDate() },
          },
        },
      },
      take: 10,
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                createdAt: { gte: moment().subtract(7, "d").toDate() },
              },
            },
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        subscriptions: {
          _count: "desc",
        },
      },
    });

    const mostPopularProducts = await ctx.prisma.product.findMany({
      where: {
        verified: true,
      },
      take: 10,
      orderBy: {
        subscriptions: {
          _count: "desc",
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const forYouCategories: ForYouCategory[] = [];

    for (const categoryId of Object.keys(visitedCategories)) {
      forYouCategories.push({
        categoryId,
        products: await ctx.prisma.product.findMany({
          where: {
            categoryId,
            subscriptions: {
              none: {
                userId: ctx.auth.id,
              },
            },
            verified: true,
          },
          take: 10,
          include: { category: { select: { name: true } } },
        }),
      });
    }

    if (Object.keys(visitedCategories).length < 3) {
      const categories = await ctx.prisma.category.findMany({
        where: {
          id: {
            notIn: [...Object.keys(visitedCategories)],
          },
        },
        select: {
          id: true,
          products: {
            where: {
              verified: true,
              subscriptions: {
                none: {
                  userId: ctx.auth.id,
                },
              },
            },
            include: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        take: 2,
      });

      categories.forEach((category) => forYouCategories.push({ categoryId: category.id, products: category.products }));
    }

    forYouCategories.sort(() => Math.random() - 0.5);

    const productSuggestion: { name: string; products: ForYouProduct[] }[] = [];

    const subscriptions = await ctx.prisma.subscription.findMany({ where: { userId: ctx.auth.id }, select: { productId: true }, take: 2 });

    for (const subscription of subscriptions) {
      const products: ForYouProduct[] = await ctx.prisma.product.findMany({
        where: {
          verified: true,
          subscriptions: {
            every: {
              userId: {
                not: ctx.auth.id,
              },
              productId: {
                not: subscription.productId,
              },
            },
            some: {
              user: {
                subscriptions: {
                  some: {
                    active: true,
                    productId: subscription.productId,
                  },
                },
              },
            },
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      productSuggestion.push({
        name: (await ctx.prisma.product.findUnique({ where: { id: subscription.productId ?? "" }, select: { name: true } }))?.name ?? "",
        products,
      });
    }

    const newProducts = await ctx.prisma.product.findMany({
      where: {
        createdAt: { gte: moment().subtract(14, "d").toDate() },
        verified: true,
      },
      take: 10,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      forYouProducts,
      trendingProducts,
      mostPopularProducts,
      forYouCategories,
      productSuggestion,
      newProducts,
    };
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

    const images: { url: string }[] = [];

    product.images?.forEach((image) => images.push({ url: `https://${env.PRODUCT_IMAGE}.s3.ap-southeast-1.amazonaws.com/${image}.jpg` }));

    return {
      product,
      rank: rank ?? 0,
      rating: rating ?? 0,
      wishlisted: (user?.wishlist?.length || 0) > 0,
      review: user?.reviews,
      subscribed: (user?.subscriptions?.length || 0) > 0,
      logo: `https://${env.PRODUCT_LOGO}.s3.ap-southeast-1.amazonaws.com/${product?.id}.jpg`,
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
        verified: true,
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
