window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const genreDropdown = document.getElementById('genre-dropdown');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const titleElement = document.getElementById('current-view-title');

    let currentPage = 1;
    let currentQuery = 'trending';
    let currentMode = 'trending'; 

    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-mode');

    async function fetchMovies(query, mode = 'search', page = 1) {
        let url = `/api/movies?query=${encodeURIComponent(query)}&page=${page}`;
        if (mode === 'genre') url = `/api/movies?genre=${query}&page=${page}`;
        if (mode === 'id') url = `/api/movies?id=${query}&append=videos,watch/providers`;

        try {
            const response = await fetch(url);
            return await response.json();
        } catch (err) {
            console.error("Fetch failed", err);
            return { results: [] };
        }
    }

    async function showMovieDetails(movieId) {
        const movie = await fetchMovies(movieId, 'id');
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer' || v.type === 'Teaser');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                ${trailer ? `<iframe width="100%" height="450" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : '<div style="padding:60px; text-align:center;">Trailer not available.</div>'}
                <div class="modal-info" style="padding:30px; color: white;">
                    <h2 style="margin-top:0;">${movie.title}</h2>
                    <p style="line-height:1.6; opacity:0.8;">${movie.overview}</p>
                    <div style="margin-top:20px;">
                        <h3>Available on:</h3>
                        <div class="provider-logos">${providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" title="${p.provider_name}">`).join('') || 'Check local listings'}</div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('.close-button').onclick = () => modal.remove();
        window.onclick = (e) => { if (e.target == modal) modal.remove(); };
    }

    function displayMovies(data, append = false) {
        const movies = data.results || [];
        if (!append) resultsContainer.innerHTML = "";

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            card.innerHTML = `
                <img src="${poster}" style="width:100%;">
                <div style="padding:15px; text-align:center;">
                    <h3 style="font-size:0.95rem; margin-bottom:12px; height:40px; overflow:hidden;">${movie.title}</h3>
                    <button class="view-btn" style="background:#e50914; color:white; border:none; padding:10px 15px; cursor:pointer; border-radius:5px; font-weight:bold; width:100%;">View Details</button>
                </div>`;
            card.querySelector('.view-btn').onclick = () => showMovieDetails(movie.id);
            resultsContainer.appendChild(card);
        });

        loadMoreBtn.style.display = (data.total_pages > currentPage) ? "inline-block" : "none";
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value;
        if (!val) return;
        resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Consulting the Movie Oracle...</p>";
        
        try {
            const aiRes = await fetch('/api/chat', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ message: val }) });
            const aiData = await aiRes.json();
            const recommendation = aiData.choices[0].message.content;
            
            currentPage = 1;
            currentQuery = recommendation;
            currentMode = 'search';
            
            const movieData = await fetchMovies(recommendation, 'search');
            displayMovies(movieData);
            titleElement.innerText = "Suggested: " + recommendation;
        } catch (e) {
            resultsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>Connection Error.</p>";
        }
    };

    genreDropdown.onchange = async (e) => {
        if (!e.target.value) return;
        currentPage = 1; currentQuery = e.target.value; currentMode = 'genre';
        const data = await fetchMovies(currentQuery, 'genre');
        displayMovies(data);
        titleElement.innerText = e.target.options[e.target.selectedIndex].text;
    };

    loadMoreBtn.onclick = async () => {
        currentPage++;
        const data = await fetchMovies(currentQuery, currentMode, currentPage);
        displayMovies(data, true);
    };

    fetchMovies('trending', 'search').then(displayMovies);
});
