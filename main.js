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
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:3000; background:#111; width:95%; max-width:700px; border-radius:15px; overflow:hidden;">
                <div style="background:#000; padding:10px; display:flex; justify-content:flex-end;"><button class="close-btn" style="background:#e50914; color:white; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer; font-weight:bold;">&times;</button></div>
                <iframe width="100%" height="350" src="https://www.youtube.com/embed/${trailer?.key || ''}?autoplay=1" frameborder="0" allowfullscreen></iframe>
                <div style="padding:20px; color:white;">
                    <h2>${movie.title}</h2>
                    <p style="font-size:0.9rem; opacity:0.8;">${movie.overview}</p>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('.close-btn').onclick = () => modal.remove();
    }

    function displayMovies(data, append = false) {
        const movies = data.results || [];
        if (!append) resultsContainer.innerHTML = "";
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750';
            card.innerHTML = `<img src="${poster}"><div style="padding:15px; text-align:center;"><h3>${movie.title}</h3><button class="view-btn">Details</button></div>`;
            card.querySelector('.view-btn').onclick = () => showMovieDetails(movie.id);
            resultsContainer.appendChild(card);
        });
        loadMoreBtn.style.display = (data.total_pages > currentPage) ? "inline-block" : "none";
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        toggleLoading(true);
        currentMode = 'search'; currentQuery = val; currentPage = 1;
        const data = await fetchMovies(val, 'search');
        displayMovies(data);
        titleElement.innerText = "Results for: " + val;
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

    fetchMovies('', 'trending').then(displayMovies);
});
