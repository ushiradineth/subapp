import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/clerk-expo";

import { ThemeProvider } from "~/utils/Theme";
import { TRPCProvider } from "~/utils/api";
import { tokenCache } from "~/utils/cache";

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY as string} tokenCache={tokenCache}>
      <TRPCProvider>
        <ThemeProvider>
          <SafeAreaProvider style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
            <StatusBar />
          </SafeAreaProvider>
        </ThemeProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
