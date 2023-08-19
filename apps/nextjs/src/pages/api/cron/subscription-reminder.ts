import { type NextApiRequest, type NextApiResponse } from "next";
import { render } from "@react-email/render";
import moment from "moment";

import { emailRouter } from "@acme/api/src/router/email";
import { prisma } from "@acme/db";
import { SubscriptionReminder } from "@acme/email";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      active: true,
    },
    select: {
      startedAt: true,
      tier: true,
      product: true,
      user: true,
      template: true,
    },
  });

  const emailSent = { week: 0, day: 0 };

  subscriptions.forEach(async (subscription) => {
    const totalCycles = Math.floor(moment(moment.now()).diff(subscription?.startedAt, "days", false) / (subscription?.tier.period ?? 1));
    const nextPayment = moment(subscription?.startedAt).add((totalCycles + 1) * (subscription?.tier.period ?? 0), "days");
    const nextPaymentInDays = moment(nextPayment).diff(moment.now(), "days", false);

    const email = emailRouter.createCaller({ auth: { id: "cronjob" }, prisma, session: null });

    const product = subscription.product
      ? {
          name: subscription.product.name,
          url: subscription.product.link ?? "",
        }
      : {
          name: subscription.template?.name ?? "",
          url: undefined,
        };

    const user = {
      name: subscription.user.name,
    };

    const subscriptionObject = {
      paymentAmount: subscription.tier.price,
      paymentDueDate: nextPayment.format("DD/MM/YYYY"),
    };

    if (nextPaymentInDays === 7) {
      await email.sendEmail({
        receiver: subscription.user.email,
        subject: `Upcoming Payment Reminder for Your ${subscription.product?.name ?? subscription.template?.name} Subscription`,
        html: render(
          SubscriptionReminder({
            product,
            user,
            subscription: subscriptionObject,
            period: "week",
          }),
        ),
      });

      emailSent.week = emailSent.week + 1;
    }

    if (nextPaymentInDays === 1) {
      await email.sendEmail({
        receiver: subscription.user.email,
        subject: `Upcoming Payment Reminder for Your ${subscription.product?.name ?? subscription.template?.name} Subscription`,
        html: render(
          SubscriptionReminder({
            product,
            user,
            subscription: subscriptionObject,
            period: "day",
          }),
        ),
      });

      emailSent.day = emailSent.day + 1;
    }
  });

  response.status(200).json({
    body: {
      remindersSent: emailSent,
    },
  });
}
