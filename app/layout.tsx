"use client";

import "./globals.css";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <html lang="en">
      <body>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid currentColor",
            background: "transparent",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        {children}
      </body>
    </html>
  );
}
