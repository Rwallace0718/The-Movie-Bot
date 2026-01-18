window.addEventListener('DOMContentLoaded', () => {
    const API_PATHS = { chat: '/api/chat', movies: '/api/movies' };

    async function fetchMovies(query, isGenre = false) {
        try {
            const param = isGenre ? `genre=${query}` : `query=${encodeURIComponent(query)}`;
            const response = await fetch(`${API_PATHS.movies}?${param}`);
            const data = await response.json();
            return data.results || [];
        } catch (error) { return []; }
    }

    function displayMovies(movies) {
        const container = document.getElementById('results-container');
        container.innerHTML = "";

        if (movies.length === 0) {
            container.innerHTML = "<p>No movies found. Try another search!</p>";
            return;
        }

        movies.forEach(movie => {
            // Create a clickable link for each card
            const card = document.createElement('a');
            card.className = 'movie-card';
            card.href = `https://www.themoviedb.org/movie/${movie.id}`;
            card.target = "_blank"; // Opens in new tab
            
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

    document.getElementById('search-button')?.addEventListener('click', async () => {
        const input = document.getElementById('movie-input').value;
        if (!input) return;
        document.getElementById('results-container').innerHTML = "<p>Consulting the Oracle...</p>";
        const aiResponse = await fetch(API_PATHS.chat, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input })
        });
        const aiData = await aiResponse.json();
        const movies = await fetchMovies(aiData.choices[0].message.content);
        displayMovies(movies);
    });

    document.getElementById('genre-dropdown')?.addEventListener('change', async (e) => {
        if (!e.target.value) return;
        document.getElementById('results-container').innerHTML = "<p>Loading Genre...</p>";
        const movies = await fetchMovies(e.target.value, true);
        displayMovies(movies);
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});
