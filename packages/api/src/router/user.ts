import { render } from "@react-email/render";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { z } from "zod";

import { OneTimePassword } from "@acme/email";

import { env } from "../../env.mjs";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { emailRouter } from "./email";
import { s3Router } from "./s3";

export const userRouter = createTRPCRouter({
  authorize: publicProcedure.input(z.object({ email: z.string(), password: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account does not exists",
      });
    }
    const userVerified = bcrypt.compareSync(input.password, user.password);

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    if (userVerified) {
      return {
        ...userData,
        token: jwt.sign(userData, env.JWT_SECRET),
        expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).getTime(), // 24 Hours
      };
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid Credentials",
    });
  }),

  register: publicProcedure
    .input(z.object({ email: z.string(), password: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });

      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account already exists",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(input.password, salt);

      return await ctx.prisma.user.create({
        data: { name: input.name, email: input.email, password: hashedPassword },
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

      const user = await ctx.prisma.user.update({ where: { id: input.id }, data, select: { id: true, name: true } });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account doesnt exists",
        });
      }

      return user;
    }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.delete({ where: { id: input.id }, select: { id: true, name: true } });
    const s3 = s3Router.createCaller({ ...ctx });
    await s3.deleteObject({ bucket: env.USER_ICON, fileName: `${input.id}.jpg` });

    return user;
  }),

  forgotPassword: publicProcedure.input(z.object({ email: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email }, select: { id: true, name: true, email: true } });

    if (!user) {
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

    await ctx.prisma.passwordResetRequest.deleteMany({ where: { userId: user?.id } });
    await ctx.prisma.passwordResetRequest.create({ data: { userId: user?.id ?? "", otp: hashedOtp } });

    return user;
  }),

  resetPassword: publicProcedure
    .input(z.object({ email: z.string(), otp: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account doesnt exists",
        });
      }

      const request = await ctx.prisma.passwordResetRequest.findFirst({ where: { userId: user.id } });

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

      return await ctx.prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword }, select: { id: true, name: true } });
    }),

  getSubscriptionsPage: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.auth.id },
      select: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          where: { active: true },
          include: {
            tier: { select: { price: true, period: true, name: true } },
            template: { select: { name: true } },
            product: { select: { name: true } },
          },
        },
      },
    });

    const getMultiplicator = (period: number) => {
      switch (period) {
        case 1:
          return 28;
        case 7:
          return 4;
        case 28:
          return 1;
        case 365:
          return 0.12;
        default:
          return 1;
      }
    };

    const cost = user?.subscriptions.reduce((acc, curr) => {
      return acc + curr.tier.price * getMultiplicator(curr.tier.period);
    }, 0);

    return {
      cost,
      count: user?.subscriptions.length,
      subscriptions: user?.subscriptions,
    };
  }),

  wishlist: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.auth.id },
      select: {
        wishlist: {
          include: { category: { select: { name: true } } },
        },
      },
    });

    return {
      wishlist: user?.wishlist,
    };
  }),

  profile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.auth.id }, select: { createdAt: true } });
  }),

  subscriptions: protectedProcedure
    .input(z.object({ showTerminatedSubscripitions: z.boolean().optional().default(false) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.user.findUnique({
        where: { id: ctx.auth.id },
        select: {
          subscriptions: {
            orderBy: input.showTerminatedSubscripitions ? { deletedAt: "desc" } : { createdAt: "desc" },
            where: {
              active: !input.showTerminatedSubscripitions,
            },
            include: {
              template: {
                select: {
                  name: true,
                },
              },
              tier: {
                select: {
                  name: true,
                  price: true,
                  period: true,
                },
              },
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }),
});
