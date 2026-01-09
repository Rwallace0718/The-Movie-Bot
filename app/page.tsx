"use client";

import { useState } from "react";

type Movie = {
  title: string;
  overview: string;
  poster_path: string;
  trailer_url?: string;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();

      if (!data.reply) {
        setMovies([]);
        alert("No response received");
        setLoading(false);
        return;
      }

      // Parse reply into movie objects
      const parsedMovies: Movie[] = data.reply.map((movie: any) => {
        let trailer_url;
        if (movie.trailer_key) {
          trailer_url = `https://www.youtube.com/watch?v=${movie.trailer_key}`;
        }
        return {
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          trailer_url,
        };
      });

      setMovies(parsedMovies.slice(0, 10)); // show first 10 movies
    } catch (err) {
      console.error(err);
      alert("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () =>
    setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className={theme === "dark" ? "bg-gray-900 text-white min-h-screen" : "bg-gray-100 text-gray-900 min-h-screen"}>
      <div className="flex justify-end p-4">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Movie Bot 🎬
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex mb-6 w-full max-w-md"
        >
          <input
            type="text"
            placeholder="What movies are you in the mood for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded-r-md hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Send"}
          </button>
        </form>

        {movies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.title}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center text-center"
              >
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-auto mb-4 rounded"
                  />
                )}
                <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
                <p className="text-sm mb-4">{movie.overview}</p>
                {movie.trailer_url && (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Watch Trailer
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
