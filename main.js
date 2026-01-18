window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const genreDropdown = document.getElementById('genre-dropdown');

    // Toggle logic
    document.getElementById('theme-toggle').onclick = () => {
        document.body.classList.toggle('light-mode');
    };

    async function fetchMovies(query, isGenre = false) {
        // If it's a genre selection, use the genre ID. Otherwise, use the search query.
        const url = isGenre ? `/api/movies?genre=${query}` : `/api/movies?query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results || [];
    }

    function displayMovies(movies) {
        resultsContainer.innerHTML = "";
        if (!movies || movies.length === 0) {
            resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No movies found. Try something else!</p>";
            return;
        }
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            card.innerHTML = `
                <img src="${poster}" style="width:100%; border-radius:10px;">
                <div class="movie-info" style="padding:10px; text-align:center;">
                    <h3>${movie.title}</h3>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }

    // AI Search Trigger
    searchBtn.onclick = async () => {
        const userText = movieInput.value;
        if (!userText) return;

        resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>The AI is thinking...</p>";

        try {
            // 1. Ask the AI for a movie name based on the vibe
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });
            
            if (!aiResponse.ok) throw new Error("AI failed");
            
            const aiData = await aiResponse.json();
            const aiRecommendation = aiData.choices[0].message.content;

            // 2. Take that recommendation and find it in the Movie Database
            const movies = await fetchMovies(aiRecommendation);
            displayMovies(movies);
            document.getElementById('current-view-title').innerText = "AI Recommended: " + aiRecommendation;
        } catch (err) {
            console.error(err);
            resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Error connecting to AI. Check your OpenAI Key in Vercel.</p>";
        }
    };

    // Genre selection trigger
    genreDropdown.onchange = async (e) => {
        if (!e.target.value) return;
        const movies = await fetchMovies(e.target.value, true);
        displayMovies(movies);
        document.getElementById('current-view-title').innerText = e.target.options[e.target.selectedIndex].text;
    };

    // Initial Trending Load
    fetchMovies('trending').then(displayMovies);
});
