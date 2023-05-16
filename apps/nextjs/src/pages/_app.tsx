import "../styles/globals.css";
import type { AppType } from "next/app";
import localFont from "next/font/local";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";
import NavigationBar from "~/components/NavigationBar";

const CalSans = localFont({
  src: "../../public/CalSans-SemiBold.ttf",
  variable: "--font-sans",
});

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <main className={`${CalSans.variable} font-sans`}>
        <NavigationBar />
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
