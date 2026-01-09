"use client"; // Required for hooks

import { useState } from "react";

interface Movie {
  title: string;
  poster_path: string;
  release_date?: string;
  overview?: string;
}

export default function Page() {
  const [message, setMessage] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setMovies([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      // Parse response safely
      if (!data.reply) {
        alert("No response received from the bot.");
        setLoading(false);
        return;
      }

      let parsedMovies: Movie[] = [];
      try {
        parsedMovies = JSON.parse(data.reply).slice(0, 10);
      } catch (err) {
        console.error("Error parsing bot response:", err);
        alert("Failed to parse response. Check console.");
      }

      setMovies(parsedMovies);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch movies. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full px-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Movie Recommendation Bot
      </h1>

      {/* Chat input */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md gap-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What kind of movies are you in the mood for?"
          className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
        >
          {loading ? "Loading..." : "Send"}
        </button>
      </form>

      {/* Movie results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-5xl">
        {movies.map((movie, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center dark:text-white"
          >
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="rounded shadow-md"
              />
            ) : (
              <div className="w-32 h-48 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm">
                No Image
              </div>
            )}
            <p className="mt-2 font-semibold">{movie.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
