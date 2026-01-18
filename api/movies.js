export default async function handler(req, res) {
    const { query, genre, id, append } = req.query;
    const TMDB_KEY = process.env.TMDB_API_KEY;

    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=en-US`;

    // 1. If we are asking for a SPECIFIC movie's details (Trailers/Streaming)
    if (id) {
        url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&append_to_response=${append}`;
    } 
    // 2. If we are browsing by GENRE ID
    else if (genre) {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=${genre}&sort_by=popularity.desc`;
    } 
    // 3. If we are doing a TEXT SEARCH
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
