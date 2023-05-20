import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider } from "~/utils/Theme";
import { TRPCProvider } from "~/utils/api";

const RootLayout = () => {
  return (
      <TRPCProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar />
        </ThemeProvider>
      </TRPCProvider>
  );
};

export default RootLayout;
