export default async function handler(req, res) {
  const { query } = req.query; // This gets the movie name from the URL
  const apiKey = process.env.TMDB_API_KEY;

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
}
