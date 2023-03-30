import React from "react";
import { useColorScheme } from "react-native";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import config from "../../tamagui.config";
import { TamaguiProvider, Theme } from "tamagui";

const ThemeContext = React.createContext<{
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}>({
  theme: "light",
  setTheme: (theme) => console.warn("no theme provided"),
});

export const useTheme = () => React.useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const color = useColorScheme();
  const [theme, setTheme] = React.useState<"light" | "dark">(color === "light" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <TamaguiProvider config={config}>
        <ApplicationProvider {...eva} theme={theme === "light" ? eva.light : eva.dark}>
          <Theme name={theme}>{children}</Theme>
        </ApplicationProvider>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
};
