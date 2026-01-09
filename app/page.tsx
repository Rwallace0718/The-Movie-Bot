"use client";

import { useState } from "react";

interface Movie {
  title: string;
  year: number;
  genre: string;
  poster: string;
  trailer: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // default dark mode

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setMovies([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: "test-session" }),
      });

      const data = await res.json();

      if (data.movies && data.movies.length > 0) {
        setMovies(data.movies);
      } else {
        alert("Bot did not return movies");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting bot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900" : "bg-gray-100"} min-h-screen p-6 transition-colors duration-300`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`${darkMode ? "text-white" : "text-gray-900"} text-4xl font-bold`}>The Movie Bot</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded border border-gray-500 hover:bg-gray-500 hover:text-white transition-colors"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Type a movie genre or theme..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`w-2/3 p-2 rounded-l border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
          }`}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Recommend"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.title}
            className={`rounded shadow-lg p-4 flex flex-col items-center transition-colors duration-300 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {movie.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-64 object-cover rounded mb-4"
              />
            )}
            <h2 className={`${darkMode ? "text-white" : "text-gray-900"} text-xl font-semibold text-center`}>
              {movie.title}
            </h2>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{movie.genre}</p>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{movie.year}</p>
            {movie.trailer && (
              <a
                href={movie.trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-400 hover:underline"
              >
                Watch Trailer
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
