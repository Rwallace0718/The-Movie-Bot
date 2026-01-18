// Safety Check - If you see this alert, the file loaded!
console.log("Movie Bot Script Loaded");

window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const genreDropdown = document.getElementById('genre-dropdown');
    const themeToggle = document.getElementById('theme-toggle');

    // THEME TOGGLE (This should work regardless of API)
    themeToggle.onclick = () => {
        document.body.classList.toggle('light-mode');
        console.log("Theme changed");
    };

    async function fetchMovies(query, isGenre = false) {
        const url = isGenre ? `/api/movies?genre=${query}` : `/api/movies?query=${encodeURIComponent(query)}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.results || [];
        } catch (e) {
            console.error("Fetch error", e);
            return [];
        }
    }

    function displayMovies(movies) {
        resultsContainer.innerHTML = "";
        if (!movies || movies.length === 0) {
            resultsContainer.innerHTML = "<p>No movies found.</p>";
            return;
        }
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750';
            card.innerHTML = `
                <img src="${poster}" style="width:100%; border-radius:10px;">
                <div class="movie-info"><h3>${movie.title}</h3></div>
            `;
            resultsContainer.appendChild(card);
        });
    }

    searchBtn.onclick = async () => {
        const query = movieInput.value;
        if (!query) return;
        resultsContainer.innerHTML = "<p>Thinking...</p>";
        try {
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });
            const aiData = await aiResponse.json();
            const movies = await fetchMovies(aiData.choices[0].message.content);
            displayMovies(movies);
        } catch (err) {
            resultsContainer.innerHTML = "<p>Error connecting to API.</p>";
        }
    };

    genreDropdown.onchange = async (e) => {
        if (!e.target.value) return;
        const movies = await fetchMovies(e.target.value, true);
        displayMovies(movies);
    };

    // Load trending on start
    fetchMovies('trending').then(displayMovies);
});
