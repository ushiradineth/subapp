import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { SplashScreen } from "expo-router";

const Index = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded) {
    return isSignedIn ? <Redirect href="/home" /> : <Redirect href="/auth/login" />
  }

  return <SplashScreen />;
};

export default Index;
