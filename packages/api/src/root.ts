import { productRouter } from "./router/product";
import { userRouter } from "./router/user";
import { vendorRouter } from "./router/vendor";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  vendor: vendorRouter,
  user: userRouter,
  product: productRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
