import React from "react";
import { AuthProvider } from "./src/utils/AuthProvider";
import Navigation from "./src/navigation";
import { StatusBar } from "expo-status-bar";
import { TamaguiProvider } from "tamagui";
import config from "./tamagui.config";
import { ThemeProvider } from "./src/utils/Theme";

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
