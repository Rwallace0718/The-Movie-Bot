import { NextResponse } from "next/server";
import OpenAI from "openai";
import fetch from "node-fetch";
type TMDBSearchResponse = {
  results: Array<{
    id: number;
    title: string;
    poster_path: string | null;
    overview: string;
    release_date: string;
  }>;
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();

    // Prompt for OpenAI to return a list of movies in JSON
    const prompt = `
You are a helpful Movie Recommendation Bot.
User input: "${message}"

Return a JSON array called "movies" with up to 5 movies, each containing:
- title
- year
- genre

Do NOT include anything else. Only return valid JSON like this:

{
  "movies": [
    { "title": "Movie Title", "year": 2023, "genre": "Action" }
  ]
}
`;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    // Parse OpenAI response
    let movieList: { title: string; year: number; genre: string }[] = [];
    try {
      const text = response.choices[0].message?.content || "";
      const match = text.match(/\{[\s\S]*\}/); // extract JSON object
      if (match) {
        const json = JSON.parse(match[0]);
        movieList = json.movies || [];
      }
    } catch (err) {
      console.error("JSON parse error from OpenAI:", err);
    }

    // Fetch TMDB poster + trailer for each movie
    const moviesWithPosters = await Promise.all(
      movieList.map(async (m) => {
        let poster = "";
        let trailer = "";

        try {
          // Search TMDB for movie
          const searchRes = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(
              m.title
            )}`
          );
          const searchData = (await searchRes.json()) as TMDBSearchResponse;


          if (searchData.results && searchData.results.length > 0) {
            const movieData = searchData.results[0];

            // Poster
            poster = movieData.poster_path
              ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
              : "";

            // Fetch videos
            const videoRes = await fetch(
              `https://api.themoviedb.org/3/movie/${movieData.id}/videos?api_key=${process.env.TMDB_API_KEY}`
            );
            const videoData = await videoRes.json();

            const trailerObj = videoData.results?.find(
              (v: any) => v.type === "Trailer" && v.site === "YouTube"
            );
            if (trailerObj) {
              trailer = `https://www.youtube.com/watch?v=${trailerObj.key}`;
            }
          }
        } catch (err) {
          console.error("TMDB fetch error:", err);
        }

        return { ...m, poster, trailer };
      })
    );

    return NextResponse.json({ movies: moviesWithPosters });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
