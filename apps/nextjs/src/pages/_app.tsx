import type { AppType } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import NextNProgress from "nextjs-progressbar";
import { ToastContainer } from "react-toastify";

import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <Layout>
        <NextNProgress
          color="#5D76CC"
          startPosition={0.3}
          stopDelayMs={200}
          height={3}
          showOnShallow={true}
          options={{ showSpinner: false }}
        />
        <Component {...pageProps} />
        <Analytics />
        <ToastContainer
          position="bottom-right"
          toastClassName={() =>
            "bg-bgc border border-bc border relative flex p-2 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
          }
          bodyClassName={() => "text-sm font-white font-med block flex flex-row p-3"}
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Layout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
