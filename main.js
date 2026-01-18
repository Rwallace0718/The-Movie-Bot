window.addEventListener('DOMContentLoaded', () => {
    const API_PATHS = { chat: '/api/chat', movies: '/api/movies' };

    // Function to fetch movie data from your Vercel API
    async function fetchMovies(query, isGenre = false) {
        try {
            const param = isGenre ? `genre=${query}` : `query=${encodeURIComponent(query)}`;
            const response = await fetch(`${API_PATHS.movies}?${param}`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("Fetch error:", error);
            return [];
        }
    }

    // Modal popup for trailers and streaming providers
    async function showMovieDetails(movieId) {
        const response = await fetch(`${API_PATHS.movies}?id=${movieId}&append=videos,watch/providers`);
        const movie = await response.json();

        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                ${trailer ? `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : '<div style="padding:40px;">No trailer found.</div>'}
                <div class="modal-info">
                    <h2>${movie.title}</h2>
                    <p>${movie.overview}</p>
                    <div class="providers">
                        <h3>Streaming on:</h3>
                        <div class="provider-logos">
                            ${providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" title="${p.provider_name}">`).join('') || 'Check local listings'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-button').onclick = () => modal.remove();
        window.onclick = (e) => { if (e.target == modal) modal.remove(); };
    }

    function displayMovies(movies) {
        const container = document.getElementById('results-container');
        container.innerHTML = "";
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            card.innerHTML = `
                <img src="${poster}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <button class="details-btn">View Details</button>
                </div>
            `;
            card.querySelector('.details-btn').onclick = () => showMovieDetails(movie.id);
            container.appendChild(card);
        });
    }

    // Listeners
    document.getElementById('search-button').onclick = async () => {
        const input = document.getElementById('movie-input').value;
        if (!input) return;
        document.getElementById('results-container').innerHTML = "<p>Scanning the galaxy for movies...</p>";
        
        const aiResponse = await fetch(API_PATHS.chat, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input })
        });
        const aiData = await aiResponse.json();
        const movies = await fetchMovies(aiData.choices[0].message.content);
        displayMovies(movies);
    };

    document.getElementById('genre-dropdown').onchange = async (e) => {
        if (!e.target.value) return;
        const movies = await fetchMovies(e.target.value, true);
        displayMovies(movies);
    };

    document.getElementById('theme-toggle').onclick = () => {
        document.body.classList.toggle('light-mode');
    };
});
