window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const genreDropdown = document.getElementById('genre-dropdown');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const titleElement = document.getElementById('current-view-title');

    let currentPage = 1;
    let currentQuery = '';
    let currentMode = 'trending';

    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-mode');

    function toggleLoading(isLoading) {
        searchBtn.disabled = isLoading;
        searchBtn.innerHTML = isLoading ? '<span class="spinner"></span>...' : 'Search AI';
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
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer' || v.type === 'Teaser');

        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header"><button class="close-btn">&times;</button></div>
                <div class="video-container">
                    ${trailer ? `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : '<div style="padding:60px; text-align:center; color:white;">Trailer not found</div>'}
                </div>
                <div style="padding:25px; color:white;">
                    <h2 style="margin-top:0;">${movie.title}</h2>
                    <p style="opacity:0.8; line-height:1.5;">${movie.overview}</p>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('.close-btn').onclick = () => modal.remove();
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
                <img src="${poster}">
                <div style="padding:15px; text-align:center;">
                    <h3 style="font-size:0.95rem; height:40px; overflow:hidden; margin-bottom:10px;">${movie.title}</h3>
                    <button class="view-btn" style="background:#e50914; color:white; border:none; padding:10px; cursor:pointer; border-radius:5px; width:100%; font-weight:bold;">Details</button>
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
        resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding:50px;'>Consulting the Oracle...</p>";
        
        let recommendation = val;
        try {
            const aiRes = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:val}) });
            if(aiRes.ok) { 
                const aiData = await aiRes.json(); 
                recommendation = aiData.choices[0].message.content; 
            }
        } catch(e) {}

        currentMode = 'search'; currentQuery = recommendation; currentPage = 1;
        const data = await fetchMovies(recommendation, 'search');
        displayMovies(data);
        titleElement.innerText = "Suggested: " + recommendation;
        toggleLoading(false);
    };

    genreDropdown.onchange = async (e) => {
        const genreId = e.target.value;
        if(!genreId) return;
        currentMode = 'genre'; currentQuery = genreId; currentPage = 1;
        const data = await fetchMovies(genreId, 'genre');
        displayMovies(data);
        titleElement.innerText = e.target.options[e.target.selectedIndex].text;
    };

    loadMoreBtn.onclick = async () => {
        currentPage++;
        const data = await fetchMovies(currentQuery, currentMode, currentPage);
        displayMovies(data, true);
    };

    // Load trending on start
    fetchMovies('', 'trending').then(displayMovies);
});
