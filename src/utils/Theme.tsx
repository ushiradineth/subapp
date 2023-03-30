import React from "react";
import { useColorScheme } from "react-native";
import { Theme } from "tamagui";

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
      <Theme name={theme}>{children}</Theme>
    </ThemeContext.Provider>
  );
};
