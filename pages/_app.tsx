import { AppProps } from "next/app";
import { UserProvider } from "@/contexte/UserContext";
import "../src/app/globals.css";
import { useState, useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode");
    if (storedTheme === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <UserProvider>
      <div className="relative z-10">
        <Component {...pageProps} />
      </div>
    </UserProvider>
  );
}

export default MyApp;