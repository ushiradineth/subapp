import React from "react";
import { Redirect, SplashScreen } from "expo-router";
import { api } from "~/utils/api";

const Index = () => {

  // if (isLoaded) {
  //   return isSignedIn ? <Redirect href="/home" /> : <Redirect href="/auth" />
  // } 
  
  return <Redirect href="/home" />;
};

export default Index;
