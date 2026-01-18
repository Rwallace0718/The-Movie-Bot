export default async function handler(req, res) {
    const { query, genre, id, append } = req.query;
    const TMDB_KEY = process.env.TMDB_API_KEY;

    let url = "";

    // 1. Check for specific Movie ID (Trailers/Details)
    if (id) {
        url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&append_to_response=${append}`;
    } 
    // 2. Check for Trending request
    else if (query === 'trending') {
        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`;
    }
    // 3. Check for Genre ID
    else if (genre) {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=${genre}&sort_by=popularity.desc`;
    } 
    // 4. Standard Keyword Search
    else if (query) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
}
