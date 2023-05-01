import React from "react";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import * as eva from "@eva-design/eva";
import { ToastProvider } from "@tamagui/toast";
import { ApplicationProvider } from "@ui-kitten/components";
import { TamaguiProvider, Theme } from "tamagui";

import config from "../../tamagui.config";
import { SpinnerComponent } from "~/components/Spinner";

const ThemeContext = React.createContext<{
  theme: "light" | "dark" | "useColorScheme";
  setTheme: (theme: "light" | "dark") => void;
}>({
  theme: "light",
  setTheme: (theme) => console.warn("no theme provided"),
});

export const useTheme = () => React.useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const color = useColorScheme();
  const [theme, setTheme] = React.useState<"light" | "dark" | "uCS">(color === "light" ? "light" : "dark");
  const [internal, setInternal] = React.useState<"light" | "dark">(color === "light" ? "light" : "dark");

  React.useEffect(() => {
    if (theme === "uCS") setInternal(color === "light" ? "light" : "dark");
    else setInternal(theme);
  }, [theme]);

  const [loaded] = useFonts({
    Montserrat: require("../../assets/Montserrat-Regular.ttf"),
    MontserratBold: require("../../assets/Montserrat-Bold.ttf"),
  });

  return (
    <ThemeContext.Provider value={{ theme: internal, setTheme }}>
      <TamaguiProvider config={config}>
        <ApplicationProvider {...eva} theme={internal === "light" ? eva.light : eva.dark}>
          <Theme name={internal}>
            {loaded ? (
              children
            ) : (
              <SpinnerComponent />
            )}
          </Theme>
          <ToastProvider />
        </ApplicationProvider>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
};
