import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function extractIntent(message: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that extracts the type (movie or tv) and genre from a user's message. Respond in JSON only, e.g., {\"type\":\"movie\",\"genre\":\"comedy\"}."
      },
      { role: "user", content: message }
    ],
    temperature: 0,
  });

  try {
    const text = response.choices[0].message?.content || "{}";
    return JSON.parse(text);
  } catch {
    return { type: "movie", genre: "comedy" }; // fallback
  }
}
