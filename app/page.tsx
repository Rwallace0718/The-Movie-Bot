"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId: "test-session" }),
    });
    const data = await res.json();
    setReply(data.reply);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>The Movie Bot</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a movie type..."
          style={{ padding: 10, width: 300 }}
        />
        <button type="submit" style={{ marginLeft: 10, padding: 10 }}>
          Ask Bot
        </button>
      </form>
      {reply && (
        <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc" }}>
          <strong>Bot:</strong> {reply}
        </div>
      )}
    </main>
  );
}
