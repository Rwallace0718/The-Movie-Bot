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

    async function fetchMovies(query, mode = 'search', page = 1) {
        let url;
        if (mode === 'trending') {
            url = `/api/movies?query=trending&page=${page}`; // Assumes your backend handles 'trending' keyword
        } else if (mode === 'genre') {
            url = `/api/movies?genre=${query}&page=${page}`;
        } else if (mode === 'id') {
            url = `/api/movies?id=${query}&append=videos`;
        } else {
            url = `/api/movies?query=${encodeURIComponent(query)}&page=${page}`;
        }

        try {
            const res = await fetch(url);
            return await res.json();
        } catch(e) { return { results: [] }; }
    }

    async function showMovieDetails(movieId) {
        const movie = await fetchMovies(movieId, 'id');
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');
        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header"><button class="close-btn">&times;</button></div>
                ${trailer ? `<iframe width="100%" height="350" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : '<div style="padding:40px; text-align:center; color:white;">Trailer not available</div>'}
                <div style="padding:20px; color:white;">
                    <h2>${movie.title}</h2>
                    <p style="font-size:0.9rem; opacity:0.8;">${movie.overview}</p>
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
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750';
            card.innerHTML = `<img src="${poster}"><div style="padding:10px; text-align:center;"><h3 style="font-size:0.8rem; height:35px; overflow:hidden;">${movie.title}</h3><button class="view-btn" style="background:#e50914; color:white; border:none; padding:8px; width:100%; border-radius:5px; cursor:pointer;">Details</button></div>`;
            card.querySelector('.view-btn').onclick = () => showMovieDetails(movie.id);
            resultsContainer.appendChild(card);
        });
        loadMoreBtn.style.display = (data.total_pages > currentPage) ? "inline-block" : "none";
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        currentMode = 'search'; currentQuery = val; currentPage = 1;
        const data = await fetchMovies(val, 'search');
        displayMovies(data);
        titleElement.innerText = "Results for: " + val;
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

    // THIS LOADS THE INITIAL TRENDING LIST
    fetchMovies('', 'trending').then(displayMovies);
});
