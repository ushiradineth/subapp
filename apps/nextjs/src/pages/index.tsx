import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";

import AdminDashboard from "~/components/Templates/AdminDashboard";
import LandingPage from "~/components/Templates/LandingPage";
import VendorDashboard from "~/components/Templates/VendorDashboard";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  return {
    props: {
      session,
      status: session ? "authenticated" : "unauthenticated",
    },
  };
};

interface pageProps {
  status: "authenticated" | "unauthenticated";
}

export default function Index({ status }: pageProps) {
  const { data: session } = useSession();

  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  if (session?.user.role === "Admin") {
    return <AdminDashboard />;
  }

  if (session?.user.role === "Vendor") {
    return <VendorDashboard />;
  }
}
