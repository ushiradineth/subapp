import React from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { SpinnerComponent } from "~/components/Spinner";

const Index = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded) {
    isSignedIn ? router.push("/home") : router.push("auth/login");
  }

  return <SpinnerComponent />;
};

export default Index;
