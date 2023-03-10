import React from "react";
import { AuthProvider } from "./src/utils/AuthProvider";
import { NativeBaseProvider } from "native-base";
import Navigation from "./src/navigation";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "react-native-rapi-ui";

function App() {
  return (
    <ThemeProvider theme="dark">
      <NativeBaseProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
        <StatusBar />
      </NativeBaseProvider>
    </ThemeProvider>
  );
}

export default App;
