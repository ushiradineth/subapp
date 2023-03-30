import React from "react";
import { Theme } from "tamagui";
import { useColorScheme } from "react-native";

const ThemeContext = React.createContext<{ theme: "light" | "dark"; setTheme: (theme: "light" | "dark") => void }>({
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
