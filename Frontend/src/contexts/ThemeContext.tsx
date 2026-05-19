import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type ThemeType = "light" | "dark";

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem("candidate_theme") as ThemeType;
    return savedTheme ? savedTheme : "light";
  });

  const isDarkMode = theme === "dark";

  useEffect(() => {
    localStorage.setItem("candidate_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
