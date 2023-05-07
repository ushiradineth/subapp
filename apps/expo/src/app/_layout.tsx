import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/clerk-expo";

import { ThemeProvider } from "~/utils/Theme";
import { TRPCProvider } from "~/utils/api";
import { tokenCache } from "~/utils/cache";
import { BottomNavBar } from "~/components/BottomNavBar";
import { BNB_IGNORE_ROUTES } from "~/utils/routes";

const RootLayout = () => {
  const pathname = usePathname();

  return (
    <ClerkProvider publishableKey={Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY as string} tokenCache={tokenCache}>
      <TRPCProvider>
        <ThemeProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
            {!BNB_IGNORE_ROUTES.some(route => pathname.startsWith(route)) && <BottomNavBar />}
            <StatusBar />
          </SafeAreaView>
        </ThemeProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
