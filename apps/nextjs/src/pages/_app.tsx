import "../styles/globals.css";
import type { AppType } from "next/app";
import localFont from "next/font/local";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

const CalSans = localFont({
  src: "../../public/CalSans-SemiBold.ttf",
  variable: "--font-sans",
});

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <div className={`${CalSans.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
