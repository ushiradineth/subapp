import React, { useContext } from "react";
import { LogBox } from "react-native";
import { Redirect, SplashScreen } from "expo-router";

import { AuthContext } from "./_layout";

LogBox.ignoreAllLogs(true);

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
