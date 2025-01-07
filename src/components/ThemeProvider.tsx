"use client";
import { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<string>("light");
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Si un thème est stocké, l'utiliser, sinon utiliser le système
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.add(initialTheme);
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Met à jour la classe HTML
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    // Enregistre le choix dans localStorage
    localStorage.setItem("theme", newTheme);
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);