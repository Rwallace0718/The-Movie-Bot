window.onload = () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const genreDropdown = document.getElementById('genre-dropdown');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const themeToggle = document.getElementById('theme-toggle');

    let currentPage = 1;
    let currentQuery = '';
    let currentMode = 'trending';

    // 1. FIXED TOGGLE
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        console.log("Theme toggled");
    });

    async function fetchMovies(query, mode = 'search', page = 1) {
        let url = `/api/movies?query=${encodeURIComponent(query || 'trending')}&page=${page}`;
        if (mode === 'genre') url = `/api/movies?genre=${query}&page=${page}`;
        if (mode === 'id') url = `/api/movies?id=${query}&append=videos`;
        
        try {
            const res = await fetch(url);
            return await res.json();
        } catch(e) { return { results: [] }; }
    }

    function displayMovies(data, append = false) {
        if (!append) resultsContainer.innerHTML = "";
        const movies = data.results || [];
        
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const img = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750';
            card.innerHTML = `<img src="${img}"><div class="card-content"><h3>${movie.title}</h3></div>`;
            card.onclick = () => openModal(movie.id);
            resultsContainer.appendChild(card);
        });

        // 2. FIXED LOAD MORE VISIBILITY
        if (data.total_pages > currentPage) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // 3. LOAD MORE LOGIC
    loadMoreBtn.onclick = async () => {
        currentPage++;
        const data = await fetchMovies(currentQuery, currentMode, currentPage);
        displayMovies(data, true);
    };

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        searchBtn.innerText = "...";
        currentMode = 'search'; currentQuery = val; currentPage = 1;
        const data = await fetchMovies(val, 'search');
        displayMovies(data);
        searchBtn.innerText = "Search AI";
    };

    genreDropdown.onchange = async (e) => {
        const gid = e.target.value;
        if(!gid) return;
        currentMode = 'genre'; currentQuery = gid; currentPage = 1;
        const data = await fetchMovies(gid, 'genre');
        displayMovies(data);
    };

    // Initial load
    fetchMovies('', 'trending').then(displayMovies);
};

// Modal Logic
function openModal(id) {
    const modal = document.getElementById('movie-modal');
    modal.style.display = 'flex';
    // Add logic to fetch details inside here as we did before
}
document.getElementById('modal-close').onclick = () => document.getElementById('movie-modal').style.display = 'none';
