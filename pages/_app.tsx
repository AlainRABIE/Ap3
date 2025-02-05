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
      <video
        src={isDarkMode ? "/videos/black.mp4" : "/videos/video-clair.mp4"}
        autoPlay
        loop
        muted
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
      />

      <div className="relative z-10">
        <Component {...pageProps} />
      </div>
    </UserProvider>
  );
}

export default MyApp;