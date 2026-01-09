// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "The Movie Bot",
  description: "Ask the bot for movie recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#f5f5f5",
          color: "#111",
        }}
      >
        {children}
      </body>
    </html>
  );
}
