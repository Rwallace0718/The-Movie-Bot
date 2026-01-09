// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openaiKey = process.env.OPENAI_API_KEY;
const tmdbKey = process.env.TMDB_API_KEY;

if (!openaiKey) {
  throw new Error("OPENAI_API_KEY is missing in environment variables");
}
if (!tmdbKey) {
  throw new Error("TMDB_API_KEY is missing in environment variables");
}

const openai = new OpenAI({ apiKey: openaiKey });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ reply: "No message provided" }, { status: 400 });
    }

    // Ask OpenAI for movie recommendations
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Give me 10 movie titles in JSON array format based on this request: "${message}". Only return JSON. Example: ["Movie 1", "Movie 2"]`,
        },
      ],
    });

    const aiText = aiResponse.choices[0].message?.content;

    if (!aiText) {
      console.error("OpenAI returned empty response");
      return NextResponse.json({ reply: "No movies returned from OpenAI" }, { status: 500 });
    }

    let movieTitles: string[];
    try {
      movieTitles = JSON.parse(aiText);
      if (!Array.isArray(movieTitles)) throw new Error("Not an array");
    } catch (err) {
      console.error("Failed to parse OpenAI response as JSON:", aiText, err);
      return NextResponse.json({ reply: "Failed to parse movie list" }, { status: 500 });
    }

    // Fetch movie details from TMDB
    const movies = await Promise.all(
      movieTitles.map(async (title) => {
        try {
          const searchRes = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(
              title
            )}`
          );
          const searchData = await searchRes.json();

          const movieData = searchData.results?.[0];
          if (!movieData) return { title, poster_path: null, overview: "No data found" };

          return {
            title: movieData.title,
            overview: movieData.overview,
            poster_path: movieData.poster_path
              ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
              : null,
          };
        } catch (err) {
          console.error("TMDB fetch failed for:", title, err);
          return { title, poster_path: null, overview: "Failed to fetch details" };
        }
      })
    );

    return NextResponse.json({ reply: movies });
  } catch (err) {
    console.error("Unexpected error in POST /api/chat:", err);
    return NextResponse.json({ reply: "Failed to fetch movies" }, { status: 500 });
  }
}
