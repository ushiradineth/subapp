import { adminRouter } from "./router/admin";
import { categoryRouter } from "./router/category";
import { commentRouter } from "./router/comment";
import { productRouter } from "./router/product";
import { reviewRouter } from "./router/review";
import { s3Router } from "./router/s3";
import { subscriptionRouter } from "./router/subscription";
import { templateRouter } from "./router/template";
import { tierRouter } from "./router/tier";
import { userRouter } from "./router/user";
import { vendorRouter } from "./router/vendor";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  vendor: vendorRouter,
  user: userRouter,
  product: productRouter,
  tier: tierRouter,
  category: categoryRouter,
  admin: adminRouter,
  review: reviewRouter,
  comment: commentRouter,
  subscription: subscriptionRouter,
  template: templateRouter,
  s3: s3Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
