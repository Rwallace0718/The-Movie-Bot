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
            url = `/api/movies?query=trending&page=${page}`;
        } else if (mode === 'genre') {
            url = `/api/movies?genre=${query}&page=${page}`;
        } else {
            url = `/api/movies?query=${encodeURIComponent(query)}&page=${page}`;
        }

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
            
            card.innerHTML = `
                <div class="poster-wrapper">
                    <img src="${poster}" alt="${movie.title}">
                </div>
                <div class="card-content">
                    <h3>${movie.title}</h3>
                    <button class="view-btn">Details</button>
                </div>`;
            
            // Add click event for details (simplified for testing)
            card.querySelector('.view-btn').onclick = () => alert(movie.overview);
            resultsContainer.appendChild(card);
        });
        loadMoreBtn.style.display = (data.total_pages > currentPage) ? "inline-block" : "none";
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        
        searchBtn.innerText = "...";
        let aiKeyword = val;

        try {
            const aiRes = await fetch('/api/chat', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ message: `Provide 5 keywords for movies like: ${val}. Only return the keywords.` }) 
            });
            if (aiRes.ok) {
                const aiData = await aiRes.json();
                aiKeyword = aiData.choices[0].message.content;
                console.log("AI Suggestion:", aiKeyword);
            }
        } catch(e) { console.error("AI failed"); }

        currentMode = 'search'; currentQuery = aiKeyword; currentPage = 1;
        const data = await fetchMovies(aiKeyword, 'search');
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

    // Load trending on startup
    fetchMovies('', 'trending').then(displayMovies);
});
