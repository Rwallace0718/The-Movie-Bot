import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Movie Bot",
  description: "AI-powered movie recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
