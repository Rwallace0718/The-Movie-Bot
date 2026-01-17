// No more API keys at the top!
async function getMovieRecommendation(userInput) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    return data.choices[0].message.content;
}
