export async function getRecommendations(intent: { type: string; genre: string }) {
  const genreMap: Record<string, number> = {
    Comedy: 35,
    Drama: 18,
    "Sci-Fi": 878,
    Horror: 27,
    Romance: 10749,
  };

  const tmdbType = intent.type === "tv" ? "tv" : "movie";
  const genreId = genreMap[intent.genre] || 35;

  const res = await fetch(
    `https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
  );

  const data = await res.json();
  return data.results.slice(0, 5); // top 5 recommendations
}
