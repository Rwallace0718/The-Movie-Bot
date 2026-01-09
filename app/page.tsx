"use client";

import { useState } from "react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  async function sendMessage() {
    if (!message.trim()) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setResponse(data.reply || "No response");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          border: "1px solid currentColor",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h1 style={{ fontSize: "24px", textAlign: "center" }}>
          🎬 Movie Bot
        </h1>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me about movies..."
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid currentColor",
            background: "transparent",
            color: "inherit",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid currentColor",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Send
        </button>

        {response && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid currentColor",
            }}
          >
            {response}
          </div>
        )}
      </div>
    </main>
  );
}
