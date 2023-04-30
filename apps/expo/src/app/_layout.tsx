import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { TRPCProvider } from "~/utils/api";
import { ThemeProvider } from "~/utils/Theme";

const RootLayout = () => {
  return (
    <TRPCProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#f472b6",
              },
            }}
          />
          <StatusBar />
        </SafeAreaProvider>
      </ThemeProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
