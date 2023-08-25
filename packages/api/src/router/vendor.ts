import { render } from "@react-email/render";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import moment from "moment";
import { z } from "zod";

import OneTimePassword from "@acme/email/emails/OneTimePassword";

import { env } from "../../env.mjs";
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { emailRouter } from "./email";
import { s3Router } from "./s3";

export const vendorRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ email: z.string(), password: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({ where: { email: input.email } });

      if (vendor) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account already exists",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(input.password, salt);

      return ctx.prisma.vendor.create({
        data: { name: input.name, email: input.email, password: hashedPassword, accountVerified: false },
        select: { id: true, name: true },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string(), password: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const data: { name?: string; password?: string } = { name: input.name };

      if (input.password) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(input.password, salt);
        data.password = hashedPassword;
      }

      const vendor = await ctx.prisma.vendor.update({ where: { id: input.id }, data, select: { id: true, name: true } });

      if (!vendor) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account doesnt exists",
        });
      }

      return vendor;
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const vendor = await ctx.prisma.vendor.delete({ where: { id: input.id }, select: { id: true, name: true } });
    const s3 = s3Router.createCaller({ ...ctx });
    await s3.deleteObject({ bucket: env.USER_ICON, fileName: `${input.id}.jpg` });

    return vendor;
  }),

  forgotPassword: publicProcedure.input(z.object({ email: z.string() })).mutation(async ({ ctx, input }) => {
    const vendor = await ctx.prisma.vendor.findUnique({ where: { email: input.email }, select: { id: true, name: true } });

    if (!vendor) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account doesnt exists",
      });
    }

    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    const email = emailRouter.createCaller({ ...ctx });
    await email.sendEmail({
      receiver: input.email,
      subject: "One Time Password by SubM",
      html: render(OneTimePassword({ validationCode: OTP, senderEmail: env.GMAIL_ADDRESS })),
    });

    const salt = bcrypt.genSaltSync(10);
    const hashedOtp = bcrypt.hashSync(OTP, salt);

    await ctx.prisma.passwordResetRequest.deleteMany({ where: { userId: vendor?.id } });
    await ctx.prisma.passwordResetRequest.create({ data: { userId: vendor?.id ?? "", otp: hashedOtp } });

    return vendor;
  }),

  resetPassword: publicProcedure
    .input(z.object({ email: z.string(), otp: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({ where: { email: input.email } });

      if (!vendor) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account doesnt exists",
        });
      }

      const request = await ctx.prisma.passwordResetRequest.findFirst({ where: { userId: vendor.id } });

      if (!request) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset request not found",
        });
      }

      const otpVerified = bcrypt.compareSync(input.otp, request?.otp ?? "");

      if (!otpVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid OTP",
        });
      }

      const ONE_HOUR = 60 * 60 * 1000;
      if (new Date(request?.createdAt ?? "").getTime() + ONE_HOUR < Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "OTP has expired",
        });
      }

      await ctx.prisma.passwordResetRequest.delete({ where: { id: request?.id } });

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(input.password, salt);

      return await ctx.prisma.vendor.update({
        where: { id: vendor.id },
        data: { password: hashedPassword },
        select: { id: true, name: true },
      });
    }),

  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const currentWeekUsers = await ctx.prisma.user.findMany({
      where: {
        createdAt: { gte: moment().subtract(7, "d").toDate() },
      },
      select: {
        subscriptions: {
          where: {
            product: { vendorId: ctx.session?.user.id },
          },
        },
      },
    });
    const previousWeekUsers = await ctx.prisma.user.findMany({
      where: {
        createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() },
      },
      select: {
        subscriptions: {
          where: {
            product: { vendorId: ctx.session?.user.id },
          },
        },
      },
    });

    const currentWeekProducts = await ctx.prisma.product.findMany({
      where: { createdAt: { gte: moment().subtract(7, "d").toDate() }, vendorId: ctx.session?.user.id },
    });
    const previousWeekProducts = await ctx.prisma.product.findMany({
      where: {
        createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() },
        vendorId: ctx.session?.user.id,
      },
    });

    const currentWeekSubscriptions = await ctx.prisma.subscription.findMany({
      where: { createdAt: { gte: moment().subtract(7, "d").toDate() }, product: { vendorId: ctx.session?.user.id } },
    });
    const previousWeekSubscriptions = await ctx.prisma.subscription.findMany({
      where: {
        createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() },
        product: { vendorId: ctx.session?.user.id },
      },
    });

    const currentWeekActiveProducts = await ctx.prisma.product.findMany({
      where: {
        vendorId: ctx.session?.user.id,
      },
      take: 5,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            subscriptions: {
              where: {
                createdAt: { gte: moment().subtract(7, "d").toDate() },
              },
            },
          },
        },
      },
      orderBy: {
        subscriptions: {
          _count: "desc",
        },
      },
    });

    const previousWeekActiveProducts = await ctx.prisma.product.findMany({
      where: {
        id: {
          in: [...currentWeekActiveProducts.map((product) => product.id)],
        },
      },
      select: {
        _count: {
          select: {
            subscriptions: {
              where: {
                createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() },
              },
            },
          },
        },
      },
      orderBy: {
        subscriptions: {
          _count: "desc",
        },
      },
    });

    const currentWeekActiveCategories = await ctx.prisma.category.findMany({
      where: {
        products: {
          some: {
            vendorId: ctx.session?.user.id,
          },
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: {
              where: {
                createdAt: { gte: moment().subtract(7, "d").toDate() },
                vendorId: ctx.session?.user.id,
              },
            },
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
    });

    const previousWeekActiveCategories = await ctx.prisma.category.findMany({
      where: {
        id: {
          in: [...currentWeekActiveCategories.map((category) => category.id)],
        },
      },
      select: {
        _count: {
          select: {
            products: {
              where: {
                createdAt: { gte: moment().subtract(14, "d").toDate(), lte: moment().subtract(7, "d").toDate() },
                vendorId: ctx.session?.user.id,
              },
            },
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
    });

    const allProducts = await ctx.prisma.product.findMany({
      where: {
        vendorId: ctx.session?.user.id,
      },
      include: {
        subscriptions: true,
      },
    });

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
      activeProducts: {
        currentWeek: currentWeekActiveProducts,
        previousWeek: previousWeekActiveProducts,
      },
      activeCategories: {
        currentWeek: currentWeekActiveCategories,
        previousWeek: previousWeekActiveCategories,
      },
      allProducts,
      totalUsers: await ctx.prisma.user.count({ where: { subscriptions: { some: { product: { vendorId: ctx.session?.user.id } } } } }),
      totalProducts: await ctx.prisma.product.count({ where: { vendorId: ctx.session?.user.id } }),
    };
  }),
});
