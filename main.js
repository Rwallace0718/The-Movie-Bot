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

    // Helper to show/hide loading state
    function toggleLoading(isLoading) {
        if (isLoading) {
            searchBtn.innerHTML = '<span class="spinner"></span> Thinking...';
            searchBtn.style.opacity = '0.7';
            searchBtn.disabled = true;
        } else {
            searchBtn.innerHTML = 'Search AI';
            searchBtn.style.opacity = '1';
            searchBtn.disabled = false;
        }
    }

    async function fetchMovies(query, mode = 'search', page = 1) {
        let url = `/api/movies?query=${encodeURIComponent(query)}&page=${page}`;
        if (mode === 'genre') url = `/api/movies?genre=${query}&page=${page}`;
        if (mode === 'id') url = `/api/movies?id=${query}&append=videos,watch/providers`;
        try {
            const res = await fetch(url);
            return await res.json();
        } catch(e) { return { results: [] }; }
    }

    async function showMovieDetails(movieId) {
        const movie = await fetchMovies(movieId, 'id');
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header"><button class="close-button">&times;</button></div>
                <div class="video-wrapper">
                    ${trailer ? `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : '<div style="padding:60px; text-align:center; color:white;">Trailer not available</div>'}
                </div>
                <div style="padding:20px; color:white;">
                    <h2 style="margin-top:0;">${movie.title}</h2>
                    <p style="font-size:0.9rem; line-height:1.4;">${movie.overview}</p>
                    <div style="margin-top:15px;">
                        <h4 style="margin-bottom:10px;">Watch on:</h4>
                        <div class="providers">
                            ${providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" title="${p.provider_name}" style="width:40px; margin-right:8px; border-radius:8px;">`).join('') || 'Check local listings'}
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('.close-button').onclick = () => modal.remove();
        window.onclick = (e) => { if(e.target == modal) modal.remove(); };
    }

    function displayMovies(data, append = false) {
        const movies = data.results || [];
        if (!append) resultsContainer.innerHTML = "";
        
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            card.innerHTML = `
                <img src="${poster}" loading="lazy">
                <div style="padding:10px; text-align:center;">
                    <h3 style="font-size:0.85rem; height:35px; overflow:hidden; margin: 5px 0 10px 0;">${movie.title}</h3>
                    <button class="view-btn" style="background:#e50914; color:white; border:none; padding:8px; width:100%; border-radius:5px; font-weight:bold; cursor:pointer;">Details</button>
                </div>`;
            card.querySelector('.view-btn').onclick = () => showMovieDetails(movie.id);
            resultsContainer.appendChild(card);
        });
        loadMoreBtn.style.display = (data.total_pages > currentPage) ? "inline-block" : "none";
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        
        toggleLoading(true);
        resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 40px;'>The Oracle is thinking...</p>";
        
        let recommendation = val;
        try {
            const aiRes = await fetch('/api/chat', { 
                method:'POST', 
                headers:{'Content-Type':'application/json'}, 
                body:JSON.stringify({message:val}) 
            });
            if(aiRes.ok) { 
                const aiData = await aiRes.json(); 
                recommendation = aiData.choices[0].message.content; 
            }
        } catch(e) { console.error("AI Error, using fallback."); }

        currentPage = 1; 
        currentQuery = recommendation; 
        currentMode = 'search';
        const data = await fetchMovies(recommendation, 'search');
        displayMovies(data);
        titleElement.innerText = "Suggested for you: " + recommendation;
        toggleLoading(false);
    };

    genreDropdown.onchange = async (e) => {
        if(!e.target.value) return;
        currentPage = 1; 
        currentQuery = e.target.value; 
        currentMode = 'genre';
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
