import React from "react";
import { useColorScheme } from "react-native";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import config from "../../tamagui.config";
import { TamaguiProvider, Theme } from "tamagui";

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
    if(theme === "uCS") setInternal(color === "light" ? "light" : "dark")
    else setInternal(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme: internal, setTheme }}>
      <TamaguiProvider config={config}>
        <ApplicationProvider {...eva} theme={internal === "light" ? eva.light : eva.dark}>
          <Theme name={internal}>{children}</Theme>
        </ApplicationProvider>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
};
