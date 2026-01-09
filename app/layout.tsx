"use client"; // Required for hooks

import "./globals.css";
import { ReactNode, useState, useEffect } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 px-3 py-1 border rounded bg-gray-200 dark:bg-gray-800 dark:text-white text-gray-900 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>

        {children}
      </body>
    </html>
  );
}
