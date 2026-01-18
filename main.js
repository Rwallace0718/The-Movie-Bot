window.addEventListener('DOMContentLoaded', () => {
    console.log("Movie Bot JavaScript: Active and Connected.");

    const API_PATHS = {
        chat: '/api/chat',
        movies: '/api/movies'
    };

    async function fetchMovies(query, isGenre = false) {
        try {
            // If it's a genre, we send ?genre=ID. If it's search, we send ?query=text
            const param = isGenre ? `genre=${query}` : `query=${encodeURIComponent(query)}`;
            const response = await fetch(`${API_PATHS.movies}?${param}`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("Fetch Error:", error);
            return [];
        }
    }

    function displayMovies(movies) {
        const container = document.getElementById('results-container');
        if (!container) return;
        container.innerHTML = "";

        if (movies.length === 0) {
            container.innerHTML = "<p>No movies found. Try another search!</p>";
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
                : 'https://via.placeholder.com/300x450?text=No+Poster';

            card.innerHTML = `
                <img src="${poster}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Search Button Logic
    document.getElementById('search-button')?.addEventListener('click', async () => {
        const input = document.getElementById('movie-input').value;
        if (!input) return alert("Please enter a mood!");
        
        document.getElementById('results-container').innerHTML = "<p>Consulting the Movie Oracle...</p>";
        
        // AI Logic
        const aiResponse = await fetch(API_PATHS.chat, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input })
        });
        const aiData = await aiResponse.json();
        const recommendation = aiData.choices[0].message.content;

        const movies = await fetchMovies(recommendation);
        displayMovies(movies);
    });

    // Genre Dropdown Logic (The Bug Fix)
    document.getElementById('genre-dropdown')?.addEventListener('change', async (e) => {
        if (!e.target.value) return;
        document.getElementById('results-container').innerHTML = "<p>Loading Genre...</p>";
        const movies = await fetchMovies(e.target.value, true); // 'true' tells it to use Genre ID
        displayMovies(movies);
    });

    // Theme Toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});
