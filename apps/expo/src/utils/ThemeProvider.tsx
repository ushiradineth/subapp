import React, { useCallback } from "react";
import Toast, { BaseToast, ErrorToast, type ToastConfigParams } from "react-native-toast-message";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { TamaguiProvider, Theme } from "tamagui";

import config from "../../tamagui.config";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Montserrat: require("../../assets/Montserrat-Regular.ttf"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    MontserratBold: require("../../assets/Montserrat-Bold.ttf"),
  });

  const MemoizedSuccessToast = useCallback(
    (props: ToastConfigParams<unknown>) => (
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
    [],
  );

  const MemoizedErrorToast = useCallback(
    (props: ToastConfigParams<unknown>) => (
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
    [],
  );

  return (
    <TamaguiProvider config={config}>
      <Theme name={"light"}>{loaded ? children : <SplashScreen />}</Theme>
      <Toast
        position="bottom"
        bottomOffset={20}
        visibilityTime={2500}
        config={{
          success: (props) => MemoizedSuccessToast(props),
          error: (props) => MemoizedErrorToast(props),
        }}
      />
    </TamaguiProvider>
  );
};
