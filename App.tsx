import React from "react";
import Navigation from "./src/navigation";
import { AuthProvider } from "./src/utils/AuthProvider";
import { ThemeProvider } from "./src/utils/Theme";
import { StatusBar } from "expo-status-bar";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
      <StatusBar />
    </ThemeProvider>
  );
}

export default App;
