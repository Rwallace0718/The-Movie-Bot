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
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setMovies([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      const parsed: Movie[] = Array.isArray(data.reply)
        ? data.reply
        : JSON.parse(data.reply);

      setMovies(parsed.slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-md font-semibold bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow"
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shadow-md">
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIyNCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjY0IiB5PSI3MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIzNiIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCI+TW92aWUgQm90PC90ZXh0Pjwvc3ZnPg=="
            alt="Movie Bot Logo"
            className="w-28 h-28"
          />
        </div>
        <h1 className="text-4xl font-bold mt-4 text-center">
          The Movie Bot
        </h1>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl flex flex-col gap-4 mb-10"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="I'm in the mood for westerns..."
          className="p-3 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          className="py-3 rounded-md font-bold bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900"
        >
          {loading ? "Searching..." : "Send"}
        </button>
      </form>

      {/* Movies */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {movies.map((movie, i) => {
          const trailerLink =
            movie.trailer ||
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              movie.title + " trailer"
            )}`;

          return (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col"
            >
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="h-64 w-full object-cover"
                />
              )}

              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  {movie.title}
                </h2>
                <p className="text-sm flex-1 mb-3">
                  {movie.overview}
                </p>

                <a
                  href={trailerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-semibold"
                >
                  ▶ Watch Trailer
                </a>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
