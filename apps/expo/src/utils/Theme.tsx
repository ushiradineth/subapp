import React from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { TamaguiProvider, Theme } from "tamagui";

import config from "../../tamagui.config";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded] = useFonts({
    Montserrat: require("../../assets/Montserrat-Regular.ttf"),
    MontserratBold: require("../../assets/Montserrat-Bold.ttf"),
  });

  return (
    <TamaguiProvider config={config}>
      <Theme name={"light"}>{loaded ? children : <SplashScreen />}</Theme>
      <Toast
        position="bottom"
        bottomOffset={20}
        visibilityTime={2500}
        config={{
          success: (props) => (
            <BaseToast
              {...props}
              style={{ borderLeftColor: "green", height: "100%", paddingVertical: 10 }}
              text1Style={{
                fontSize: 17,
              }}
              text2Style={{
                fontSize: 15,
              }}
            />
          ),
          error: (props) => (
            <ErrorToast
              {...props}
              style={{ borderLeftColor: "red", height: "100%", paddingVertical: 10 }}
              text1Style={{
                fontSize: 17,
              }}
              text2Style={{
                fontSize: 15,
              }}
            />
          ),
        }}
      />
    </TamaguiProvider>
  );
};
