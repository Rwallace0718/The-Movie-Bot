// --- 1. THE SEARCH LOGIC (Talks to /api/movies.js) ---
async function searchMovies(query) {
    try {
        console.log("Fetching movies for:", query);
        const response = await fetch(`/api/movies?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) throw new Error('API Folder not responding');
        
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Movie Search Error:", error);
        return [];
    }
}

// --- 2. THE AI LOGIC (Talks to /api/chat.js) ---
async function getAIRecommendation(userInput) {
    try {
        console.log("Asking AI for recommendations...");
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })
        });
        
        const data = await response.json();
        // Returns the text recommendation from OpenAI
        return data.choices[0].message.content;
    } catch (error) {
        console.error("AI Error:", error);
        return userInput; // Fallback to just using the raw input if AI fails
    }
}

// --- 3. THE DISPLAY LOGIC ---
function displayResults(movies) {
    const container = document.getElementById('results-container');
    if (!container) return;

    container.innerHTML = ""; // Clear "Thinking..." or old results

    if (movies.length === 0) {
        container.innerHTML = "<p>No movies found. Try a different search!</p>";
        return;
    }

    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'movie-card';
        // Only show image if path exists
        const poster = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
            : 'https://via.placeholder.com/200x300?text=No+Poster';

        movieDiv.innerHTML = `
            <img src="${poster}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
        `;
        container.appendChild(movieDiv);
    });
}

// --- 4. EVENT LISTENERS (The "Wiring") ---

// A. Search Button
const searchBtn = document.getElementById('search-button');
if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        const inputField = document.getElementById('movie-input');
        const resultsContainer = document.getElementById('results-container');
        
        if (!inputField.value) return alert("Please enter a movie or mood!");

        resultsContainer.innerHTML = "<p class='loading'>AI is thinking of the best movies...</p>";

        // First get AI advice, then search TMDB
        const recommendation = await getAIRecommendation(inputField.value);
        const movies = await searchMovies(recommendation);

        displayResults(movies);
    });
}

// B. Genre Dropdown
const genreDropdown = document.getElementById('genre-dropdown');
if (genreDropdown) {
    genreDropdown.addEventListener('change', async (event) => {
        const selectedGenre = event.target.value;
        if (!selectedGenre) return;
        
        const movies = await searchMovies(selectedGenre);
        displayResults(movies);
    });
}

// C. Light/Dark Toggle
const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        console.log("Theme toggled");
    });
}
