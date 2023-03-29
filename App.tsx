import React from "react";
import { AuthProvider } from "./src/utils/AuthProvider";
import Navigation from "./src/navigation";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "react-native-rapi-ui";

function App() {
  return (
    <ThemeProvider theme="dark">
        <AuthProvider>
          <Navigation />
        </AuthProvider>
        <StatusBar />
    </ThemeProvider>
  );
}

export default App;
