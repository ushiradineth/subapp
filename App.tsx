import React from "react";
import Navigation from "./src/navigation";
import { AuthProvider } from "./src/utils/AuthProvider";
import { ThemeProvider } from "./src/utils/Theme";
import config from "./tamagui.config";
import { StatusBar } from "expo-status-bar";
import { TamaguiProvider } from "tamagui";

function App() {
  return (
    <TamaguiProvider config={config}>
      <ThemeProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
        <StatusBar />
      </ThemeProvider>
    </TamaguiProvider>
  );
}

export default App;
