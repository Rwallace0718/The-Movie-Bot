window.addEventListener('DOMContentLoaded', () => {
    console.log("Movie Bot JavaScript: Active and Connected.");

    // --- 1. CONFIGURATION (Talks to your Vercel API folders) ---
    const API_PATHS = {
        chat: '/api/chat',
        movies: '/api/movies'
    };

    // --- 2. THE MOVIE SEARCH ENGINE ---
    async function fetchMoviesFromTMDB(searchTerm) {
        try {
            console.log("Searching TMDB for:", searchTerm);
            const response = await fetch(`${API_PATHS.movies}?query=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("TMDB Error:", error);
            return [];
        }
    }

    // --- 3. THE AI BRAIN ---
    async function getAIRecommendations(userInput) {
        try {
            console.log("Asking AI for advice on:", userInput);
            const response = await fetch(API_PATHS.chat, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput })
            });
            const data = await response.json();
            // Returns the movie names suggested by OpenAI
            return data.choices[0].message.content;
        } catch (error) {
            console.error("AI Error:", error);
            return userInput; // Fallback to raw input if AI fails
        }
    }

    // --- 4. THE DISPLAY ENGINE ---
    function displayMovies(movies) {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = ""; // Clear the "Thinking..." message

        if (movies.length === 0) {
            resultsContainer.innerHTML = "<p>No results found. Try a different mood!</p>";
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            
            const posterPath = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
                : 'https://via.placeholder.com/300x450?text=No+Poster';

            card.innerHTML = `
                <img src="${posterPath}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }

    // --- 5. BUTTON LISTENERS (The Wiring) ---

    // A. The Search Button
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const movieInput = document.getElementById('movie-input');
            const resultsContainer = document.getElementById('results-container');

            if (!movieInput.value) return alert("Please type a mood or genre first!");

            resultsContainer.innerHTML = "<p class='loading-text'>Consulting the Movie Oracle...</p>";

            // Step 1: Ask AI what we should search for
            const aiAdvice = await getAIRecommendations(movieInput.value);
            
            // Step 2: Search TMDB for those specific recommendations
            const movies = await fetchMoviesFromTMDB(aiAdvice);

            // Step 3: Show them on screen
            displayMovies(movies);
        });
    }

    // B. The Genre Dropdown
    const genreDropdown = document.getElementById('genre-dropdown');
    if (genreDropdown) {
        genreDropdown.addEventListener('change', async (event) => {
            const selectedGenre = event.target.value;
            if (!selectedGenre) return;

            const resultsContainer = document.getElementById('results-container');
            resultsContainer.innerHTML = "<p>Finding the best " + selectedGenre + " movies...</p>";

            const movies = await fetchMoviesFromTMDB(selectedGenre);
            displayMovies(movies);
        });
    }

    // C. Light/Dark Mode Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            console.log("Theme switched!");
        });
    }
});
