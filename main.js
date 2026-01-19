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
        // If mode is trending and query is empty, Vercel needs a specific trigger
        let searchQuery = query;
        if (mode === 'trending' || !query) searchQuery = "trending";

        let url = `/api/movies?query=${encodeURIComponent(searchQuery)}&page=${page}`;
        if (mode === 'genre') url = `/api/movies?genre=${query}&page=${page}`;
        if (mode === 'id') url = `/api/movies?id=${query}&append=videos`;

        try {
            const res = await fetch(url);
            return await res.json();
        } catch(e) { return { results: [] }; }
    }

    function displayMovies(data, append = false) {
        const movies = data.results || [];
        if (!append) resultsContainer.innerHTML = "";
        
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            
            // INLINE STYLE: aspect-ratio and object-fit here are unblockable by the browser
            card.innerHTML = `
                <img src="${poster}" style="width:100%; aspect-ratio:2/3; object-fit:cover; display:block;">
                <div style="padding:10px; text-align:center;">
                    <h3 style="font-size:0.8rem; height:32px; overflow:hidden; margin:0 0 10px 0;">${movie.title}</h3>
                    <button class="view-btn" style="background:#e50914; color:#fff; border:none; padding:8px; width:100%; border-radius:5px; cursor:pointer; font-weight:bold;">Details</button>
                </div>`;
            card.querySelector('.view-btn').onclick = () => showMovieDetails(movie.id);
            resultsContainer.appendChild(card);
        });
        loadMoreBtn.style.display = (data.total_pages > currentPage) ? "inline-block" : "none";
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        
        searchBtn.innerText = "...";
        // AI CALL: This turns "MMA" into a detailed search string
        let finalQuery = val;
        try {
            const aiRes = await fetch('/api/chat', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ message: `Translate this movie vibe into 3 specific search keywords: ${val}` }) 
            });
            if (aiRes.ok) {
                const aiData = await aiRes.json();
                finalQuery = aiData.choices[0].message.content;
            }
        } catch(e) { console.log("AI Offline, using keyword"); }

        currentMode = 'search'; currentQuery = finalQuery; currentPage = 1;
        const data = await fetchMovies(finalQuery, 'search');
        displayMovies(data);
        titleElement.innerText = "Results for: " + val;
        searchBtn.innerText = "Search AI";
    };

    genreDropdown.onchange = async (e) => {
        const gid = e.target.value;
        if(!gid) return;
        currentMode = 'genre'; currentQuery = gid; currentPage = 1;
        const data = await fetchMovies(gid, 'genre');
        displayMovies(data);
        titleElement.innerText = e.target.options[e.target.selectedIndex].text;
    };

    loadMoreBtn.onclick = async () => {
        currentPage++;
        const data = await fetchMovies(currentQuery, currentMode, currentPage);
        displayMovies(data, true);
    };

    // Initial Load
    fetchMovies('', 'trending').then(displayMovies);
});
