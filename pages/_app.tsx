import { AppProps } from "next/app";
import React, { useEffect } from 'react';
import { UserProvider } from "@/contexte/UserContext";
import "../src/app/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode");
    if (storedTheme === "true") {
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