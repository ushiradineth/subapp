import "../styles/globals.css";
import type { AppType } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";
import NavigationBar from "~/components/NavigationBar";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
        <NavigationBar />
        <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
