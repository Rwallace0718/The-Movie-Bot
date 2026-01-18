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

    // Function to show Trailer and Streaming info in a popup
    async function showMovieDetails(movieId) {
        const resultsContainer = document.getElementById('results-container');
        // Fetch extra data: videos (trailers) and watch providers (streaming)
        const response = await fetch(`${API_PATHS.movies}?id=${movieId}&append=videos,watch/providers`);
        const movie = await response.json();

        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        // Create the Modal
        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                ${trailer ? `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : '<p>No trailer available</p>'}
                <div class="modal-info">
                    <h2>${movie.title}</h2>
                    <p>${movie.overview}</p>
                    <div class="providers">
                        <h3>Available on:</h3>
                        <div class="provider-logos">
                            ${providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" title="${p.provider_name}">`).join('') || 'Check local listings'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-button').onclick = () => modal.remove();
        window.onclick = (event) => { if (event.target == modal) modal.remove(); };
    }

    function displayMovies(movies) {
        const container = document.getElementById('results-container');
        container.innerHTML = "";
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300x450';
            card.innerHTML = `
                <img src="${poster}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <button class="details-btn">View Trailer</button>
                </div>
            `;
            // Trigger the details popup on click
            card.querySelector('.details-btn').onclick = () => showMovieDetails(movie.id);
            container.appendChild(card);
        });
    }

    // Existing Listeners (Search and Genre)
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
        const movies = await fetchMovies(e.target.value, true);
        displayMovies(movies);
    });
});
