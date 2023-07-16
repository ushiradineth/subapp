import { TRPCError } from "@trpc/server";
import moment from "moment";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  update: adminProcedure.input(z.object({ id: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    const admin = await ctx.prisma.admin.update({ where: { id: input.id }, data: { name: input.name } });
    if (!admin) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account doesnt exists",
      });
    }

    return admin;
  }),

  dashboard: adminProcedure.query(async ({ ctx }) => {
    const currentWeekUsers = await ctx.prisma.user.findMany({ where: { createdAt: { gte: moment().subtract(7, "d").toDate() } } });
    const previousWeekUsers = await ctx.prisma.user.findMany({
      where: { createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() } },
    });

    const currentWeekProducts = await ctx.prisma.product.findMany({ where: { createdAt: { gte: moment().subtract(7, "d").toDate() } } });
    const previousWeekProducts = await ctx.prisma.product.findMany({
      where: { createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() } },
    });

    const currentWeekSubscriptions = await ctx.prisma.subscription.findMany({
      where: { createdAt: { gte: moment().subtract(7, "d").toDate() } },
    });
    const previousWeekSubscriptions = await ctx.prisma.subscription.findMany({
      where: { createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() } },
    });

    const currentWeekPopularProducts = await ctx.prisma.product.findMany({
      where: {
        subscriptions: {
          every: {
            createdAt: { gte: moment().subtract(7, "d").toDate() },
          },
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: {
        subscriptions: {
          _count: "desc",
        },
      },
    });

    const previousWeekPopularProducts = await ctx.prisma.product.findMany({
      where: {
        id: {
          in: [...currentWeekPopularProducts.map((product) => product.id)],
        },
        subscriptions: {
          every: {
            createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() },
          },
        },
      },
      select: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: {
        subscriptions: {
          _count: "desc",
        },
      },
    });

    const currentWeekPopularCategories = await ctx.prisma.category.findMany({
      where: {
        products: {
          every: {
            createdAt: { gte: moment().subtract(7, "d").toDate() },
          },
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
    });

    const previousWeekPopularCategories = await ctx.prisma.category.findMany({
      where: {
        id: {
          in: [...currentWeekPopularProducts.map((product) => product.id)],
        },
        products: {
          every: {
            createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() },
          },
        },
      },
      select: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
    });

    const currentWeekPopularVendors = await ctx.prisma.vendor.findMany({
      where: {
        products: {
          every: {
            createdAt: { gte: moment().subtract(7, "d").toDate() },
          },
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
    });

    const previousWeekPopularVendors = await ctx.prisma.vendor.findMany({
      where: {
        id: {
          in: [...currentWeekPopularProducts.map((product) => product.id)],
        },
        products: {
          every: {
            createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() },
          },
        },
      },
      select: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
    });

    const usersTurnInRate = await ctx.prisma.user.findMany({
      select: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    let usersWithASubscription = 0;
    let usersWithOutASubscription = 0;

    usersTurnInRate.forEach((user) => (user._count.subscriptions > 0 ? usersWithASubscription++ : usersWithOutASubscription++));

    const vendorTurnInRate = await ctx.prisma.vendor.findMany({
      select: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    let vendorsWithAProduct = 0;
    let vendorsWithOutAProduct = 0;

    vendorTurnInRate.forEach((vendor) => (vendor._count.products > 0 ? vendorsWithAProduct++ : vendorsWithOutAProduct++));

    return {
      users: {
        currentWeek: currentWeekUsers,
        previousWeek: previousWeekUsers,
      },
      products: {
        currentWeek: currentWeekProducts,
        previousWeek: previousWeekProducts,
      },
      subscriptions: {
        currentWeek: currentWeekSubscriptions,
        previousWeek: previousWeekSubscriptions,
      },
      popularProducts: {
        currentWeek: currentWeekPopularProducts,
        previousWeek: previousWeekPopularProducts,
      },
      popularCategories: {
        currentWeek: currentWeekPopularCategories,
        previousWeek: previousWeekPopularCategories,
      },
      popularVendors: {
        currentWeek: currentWeekPopularVendors,
        previousWeek: previousWeekPopularVendors,
      },
      userTurnInRate: {
        usersWithASubscription,
        usersWithOutASubscription,
      },
      vendorTurnInRate: {
        vendorsWithAProduct,
        vendorsWithOutAProduct,
      },
      totalUsers: await ctx.prisma.user.count(),
      totalProducts: await ctx.prisma.product.count(),
      totalVendors: await ctx.prisma.vendor.count(),
    };
  }),
});
