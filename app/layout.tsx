"use client"; // required for hooks

import "./globals.css";
import { useState, useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Apply theme to <html> for Tailwind dark mode
  useEffect(() => {
    document.documentElement.classList.remove(theme === "light" ? "dark" : "light");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <html lang="en">
      <head />
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col">
        {/* Toggle button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded border border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}
