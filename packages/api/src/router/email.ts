import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
import { z } from "zod";

import { env } from "../../env.mjs";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const emailRouter = createTRPCRouter({
  sendEmail: publicProcedure
    .input(z.object({ reciever: z.string().email(), subject: z.string(), html: z.any() }))
    .mutation(async ({ input }) => {
      async function SendEmail() {
        return new Promise((resolve) => {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: env.GMAIL_ADDRESS,
              pass: env.GMAIL_PASSWORD,
            },
          });

          const mailOptions = {
            from: env.GMAIL_ADDRESS,
            to: input.reciever,
            subject: input.subject,
            html: input.html,
          };

          transporter.sendMail(mailOptions, function (error) {
            if (error) {
              resolve(false);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to send email",
              });
            }
            resolve(true);
          });
        });
      }

      await SendEmail();
    }),
});
