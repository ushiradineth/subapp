import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { z } from "zod";

import { env } from "../../env.mjs";
import { deleteFiles } from "../lib/supabase";
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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

      return ctx.prisma.vendor.create({ data: { name: input.name, email: input.email, password: hashedPassword, accountVerified: false } });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data: { name?: string; password?: string } = { name: input.name };

      if (input.password) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(input.password, salt);
        data.password = hashedPassword;
      }

      const vendor = await ctx.prisma.vendor.update({ where: { id: input.id }, data });

      if (!vendor) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account doesnt exists",
        });
      }

      return vendor;
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const vendor = await ctx.prisma.vendor.delete({ where: { id: input.id } });

    await deleteFiles(env.USER_ICON, input.id);

    return vendor;
  }),

  forgotPassword: publicProcedure.input(z.object({ email: z.string() })).mutation(async ({ ctx, input }) => {
    const vendor = await ctx.prisma.vendor.findUnique({ where: { email: input.email } });

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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.GMAIL_ADDRESS,
        pass: env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: env.GMAIL_ADDRESS,
      to: input.email,
      subject: "One Time Password by SubM",
      text: `You have requested for a One Time Password. Your OTP is ${OTP}, if this was not requested by you, contact us through this mail. Thank you!`,
    };

    transporter.sendMail(mailOptions, async function (error) {
      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email",
        });
      } else {
        await ctx.prisma.passwordResetRequest.deleteMany({ where: { userId: vendor.id } });
        await ctx.prisma.passwordResetRequest.create({ data: { userId: vendor.id, otp: OTP } });
      }
    });

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

      const ONE_HOUR = 60 * 60 * 1000;
      if (new Date(request?.createdAt ?? "").getTime() + ONE_HOUR < Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "OTP has expired",
        });
      }

      if (input.otp !== request?.otp) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid OTP",
        });
      }

      await ctx.prisma.passwordResetRequest.delete({ where: { id: request.id } });

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(input.password, salt);

      return await ctx.prisma.vendor.update({ where: { id: vendor.id }, data: { password: hashedPassword } });
    }),
});
