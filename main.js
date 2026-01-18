window.addEventListener('DOMContentLoaded', () => {
    const API_PATHS = { chat: '/api/chat', movies: '/api/movies' };

    // CORE FETCH LOGIC
    async function fetchMovies(query, isGenre = false) {
        // If it's a genre, use ?genre=ID, otherwise use ?query=text
        const param = isGenre ? `genre=${query}` : `query=${encodeURIComponent(query)}`;
        const url = `${API_PATHS.movies}?${param}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    }

    // POPUP MODAL LOGIC (Trailers & Streaming)
    async function showMovieDetails(movieId) {
        const response = await fetch(`${API_PATHS.movies}?id=${movieId}&append=videos,watch/providers`);
        const movie = await response.json();
        
        // Find a YouTube Trailer
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer' || v.type === 'Teaser');
        // Find US Streaming Providers
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                ${trailer ? `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : '<div style="padding:40px; text-align:center;">Trailer not found.</div>'}
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
            </div>`;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-button').onclick = () => modal.remove();
        window.onclick = (e) => { if (e.target == modal) modal.remove(); };
    }

    // UI DISPLAY LOGIC
    function displayMovies(movies, title = "Results") {
        const container = document.getElementById('results-container');
        const titleElement = document.getElementById('current-view-title');
        
        if (titleElement) titleElement.innerText = title;
        container.innerHTML = "";

        if (!movies || movies.length === 0) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No movies found. Try another search!</p>";
            return;
        }

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

    // SEARCH BUTTON LOGIC
    document.getElementById('search-button').onclick = async () => {
        const input = document.getElementById('movie-input').value;
        if (!input) return;
        
        document.getElementById('results-container').innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Consulting the Movie Oracle...</p>";
        
        try {
            const aiResponse = await fetch(API_PATHS.chat, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ message: input }) 
            });
            const aiData = await aiResponse.json();
            const recommendation = aiData.choices[0].message.content;
            
            const movies = await fetchMovies(recommendation);
            displayMovies(movies, `AI Picks: ${recommendation}`);
        } catch (err) {
            document.getElementById('results-container').innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Connection Error. Please ensure your API keys are set in Vercel.</p>";
        }
    };

    // DROPDOWN LOGIC
    document.getElementById('genre-dropdown').onchange = async (e) => {
        const genreId = e.target.value;
        if (!genreId) return;
        
        const genreName = e.target.options[e.target.selectedIndex].text;
        document.getElementById('results-container').innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Finding the best " + genreName + " movies...</p>";
        
        const movies = await fetchMovies(genreId, true);
        displayMovies(movies, `Best in ${genreName}`);
    };

    // THEME TOGGLE
    document.getElementById('theme-toggle').onclick = () => {
        document.body.classList.toggle('light-mode');
    };

    // INITIAL LOAD (Trending Movies)
    async function loadInitialContent() {
        const movies = await fetchMovies('trending');
        displayMovies(movies, "Trending Now");
    }

    loadInitialContent();
});
