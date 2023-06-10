import React, { useContext } from "react";
import { Redirect, SplashScreen } from "expo-router";

import { AuthContext } from "./_layout";

const Index = () => {
  const auth = useContext(AuthContext);

  if (auth.status === "loading") return <SplashScreen />;

  if (auth.status === "authenticated" || auth.session.id !== "") {
    return <Redirect href="/home" />;
  }

  if (auth.status === "unauthenticated") {
    return <Redirect href="/auth/login" />;
  }

  return <SplashScreen />;
};

export default Index;
