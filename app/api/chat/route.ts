// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // Basic search query from user message
    const searchQuery = encodeURIComponent(message);

    // Fetch movies from TMDB
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${searchQuery}&language=en-US&page=1&include_adult=false`
    );

    if (!searchRes.ok) {
      return NextResponse.json({ error: "TMDB search failed." }, { status: 500 });
    }

    const searchData: any = await searchRes.json();

    // Limit to 10 movies
    const topMovies = searchData.results?.slice(0, 10) || [];

    // Map to the format your frontend expects
    const movies = topMovies.map((m: any) => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      release_date: m.release_date,
      rating: m.vote_average,
    }));

    return NextResponse.json({ movies });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message || "Unknown error." }, { status: 500 });
  }
}
