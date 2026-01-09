"use client";

import { useState } from "react";

type Movie = {
  title: string;
  poster_path?: string;
  overview?: string;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      if (!data.reply) {
        setError("No response from server");
        setMovies([]);
      } else {
        // If reply is already an object, don't parse again
        const parsedMovies: Movie[] = typeof data.reply === "string" 
          ? JSON.parse(data.reply)
          : data.reply;

        setMovies(parsedMovies.slice(0, 10)); // first 10 movies
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch movies");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-4xl">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center">🎬 The Movie Bot</h1>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a movie genre or keyword..."
          className="flex-1 px-4 py-2 rounded border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded font-semibold hover:opacity-90 transition"
        >
          Send
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full mt-4">
        {movies.map((movie, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-gray-200 dark:bg-gray-800 rounded p-2"
          >
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="rounded mb-2"
              />
            ) : (
              <div className="w-32 h-48 bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white mb-2">
                No Image
              </div>
            )}
            <p className="text-center font-semibold">{movie.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
