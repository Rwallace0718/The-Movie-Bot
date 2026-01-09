"use client"; // Page uses client-side hooks

import { useState } from "react";

interface Movie {
  title: string;
  overview: string;
  poster_path: string;
  trailer_url?: string;
}

export default function HomePage({
  theme,
}: {
  theme: "light" | "dark";
}) {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMovies([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await res.json();

      // Ensure we have an array of movies
      const parsedMovies: Movie[] = Array.isArray(data.reply)
        ? data.reply
        : [];

      setMovies(parsedMovies.slice(0, 10)); // first 10 movies
    } catch (err) {
      console.error(err);
      setError("No movies found. Try a different query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen p-4 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h1 className="text-4xl font-bold mb-6">The Movie Bot 🎬</h1>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md mb-6"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a movie genre or keyword..."
          className={`flex-1 px-4 py-2 rounded-l-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
              : "bg-white text-gray-900 placeholder-gray-500"
          }`}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-r-md border border-gray-400 ${
            theme === "dark"
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-200 text-gray-900 hover:bg-gray-300"
          }`}
        >
          Send
        </button>
      </form>

      {/* Loading / Error */}
      {loading && <p className="mb-4">Loading...</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Movies grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie, index) => (
          <div
            key={index}
            className={`flex flex-col items-center p-4 rounded-lg shadow-md ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="mb-2 rounded-md shadow-sm"
              />
            ) : (
              <div className="w-48 h-72 mb-2 bg-gray-400 flex items-center justify-center rounded-md">
                No Image
              </div>
            )}
            <h2 className="font-semibold text-lg mb-1 text-center">
              {movie.title}
            </h2>
            <p className="text-sm mb-2 text-center">
              {movie.overview.length > 100
                ? movie.overview.slice(0, 100) + "..."
                : movie.overview}
            </p>
            {movie.trailer_url && (
              <a
                href={movie.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                Watch Trailer
              </a>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
