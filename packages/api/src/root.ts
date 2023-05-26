import { adminRouter } from "./router/admin";
import { categoryRouter } from "./router/category";
import { productRouter } from "./router/product";
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
});

// export type definition of API
export type AppRouter = typeof appRouter;
