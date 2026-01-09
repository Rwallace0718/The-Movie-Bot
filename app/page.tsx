"use client";

import { useState } from "react";

interface Movie {
  title: string;
  overview: string;
  poster_path: string;
  trailer?: string;
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);

  const toggleTheme = () =>
    setTheme(theme === "light" ? "dark" : "light");

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

      // Parse reply into movie objects
      const parsedMovies: Movie[] = Array.isArray(data.reply)
        ? data.reply
        : JSON.parse(data.reply);

      setMovies(parsedMovies.slice(0, 10)); // limit to 10
    } catch (err) {
      console.error(err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${theme} min-h-screen w-full flex flex-col items-center justify-start bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6`}
    >
      {/* Dark/Light Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold shadow"
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-6 mt-12">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiNmZjAwMDAiIHJ4PSIyNCIvPjx0ZXh0IHg9IjY0IiB5PSI2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCI+TW92aWUgQm90PC90ZXh0Pjwvc3ZnPg=="
            alt="Movie Bot Logo"
            className="w-28 h-28"
          />
        </div>
        <h1 className="text-4xl font-bold text-center mt-4">
          The Movie Bot
        </h1>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-xl mb-6"
      >
        <input
          type="text"
          placeholder="Enter movie genre or title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full py-3 bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900 font-bold rounded hover:opacity-90 transition"
        >
          {loading ? "Loading..." : "Send"}
        </button>
      </form>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {movies.length === 0 && !loading && (
          <p className="text-center col-span-full">
            No movies to display.
          </p>
        )}
        {movies.map((movie, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden flex flex-col"
          >
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {movie.title}
              </h2>
              <p className="text-sm flex-1">{movie.overview}</p>
              {movie.trailer && (
                <a
                  href={movie.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-blue-500 hover:underline"
                >
                  Watch Trailer
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
