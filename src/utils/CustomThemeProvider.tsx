import React from "react";
import { ThemeProvider } from "react-native-rapi-ui";

const ThemeContext = React.createContext<{ theme: "light" | "dark"; setTheme: (theme: "light" | "dark") => void }>({
  theme: "light",
  setTheme: (theme) => console.warn("no theme provider"),
});

const useTheme = () => React.useContext(ThemeContext);
export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // React.useEffect(() => {
  //   if (colorMode !== theme) {
  //     setTheme(theme);
  //   }
  // }, [theme]);

  return (
    <ThemeProvider theme={theme}>
    </ThemeProvider>
  );
};
