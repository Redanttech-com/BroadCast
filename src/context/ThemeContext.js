import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

const lightTheme = {
  mode: "light",
  colors: {
    background: "#ffffff",
    text: "gray",
    primary: "#090043",
    card: "#f3f4f6",
  },
};

const darkTheme = {
  mode: "dark",
  colors: {
    background: "#080021",
    text: "#ffffff",
    primary: "#60a5fa",
    card: "#1f2937",
  },
};

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [themeName, setThemeName] = useState(colorScheme || "light");

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeName(colorScheme);
    });
    return () => listener.remove();
  }, []);

  const theme = themeName === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
