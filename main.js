document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const modal = document.getElementById('movie-modal');

    let currentPage = 1;
    let currentQuery = 'trending';
    let isAILogic = false;

    // --- THEME TOGGLE ---
    themeToggle.onclick = () => document.body.classList.toggle('light-mode');

    // --- FETCH ENGINE ---
    async function fetchMovies(query, page = 1, append = false) {
        if (!append) resultsContainer.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding:50px;'>Consulting the AI Oracle...</div>";
        
        try {
            const res = await fetch(`/api/movies?query=${encodeURIComponent(query)}&page=${page}`);
            const data = await res.json();
            renderMovies(data.results, append);
            
            // Handle Load More Visibility
            loadMoreBtn.style.display = (data.total_pages > page) ? "inline-block" : "none";
        } catch (err) {
            resultsContainer.innerHTML = "Error loading movies.";
        }
    }

    // --- AI SEARCH PIPELINE ---
    async function startAISearch() {
        const userInput = movieInput.value.trim();
        if (!userInput) return;

        searchBtn.innerText = "Thinking...";
        isAILogic = true;
        currentPage = 1;

        try {
            // Ask AI for titles based on vibe
            const aiRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Suggest 5 movie titles for: ${userInput}. Return only titles, comma separated.` })
            });
            const aiData = await aiRes.json();
            currentQuery = aiData.choices[0].message.content;
            
            await fetchMovies(currentQuery, 1, false);
            document.getElementById('current-view-title').innerText = "AI Suggestions for: " + userInput;
        } catch (e) {
            await fetchMovies(userInput, 1, false); // Fallback to keyword
        } finally {
            searchBtn.innerText = "Search AI";
        }
    }

    // --- RENDERING ---
    function renderMovies(movies, append) {
        if (!append) resultsContainer.innerHTML = "";
        movies.forEach(movie => {
            if (!movie.poster_path) return;
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" loading="lazy">
                <div class="card-content"><h3>${movie.title}</h3></div>
            `;
            card.onclick = () => openModal(movie.id);
            resultsContainer.appendChild(card);
        });
    }

    // --- MODAL & DETAILS ---
    async function openModal(id) {
        modal.style.display = 'flex';
        document.getElementById('video-area').innerHTML = '<p style="color:white;text-align:center;padding-top:20%;">Loading Details...</p>';
        
        const res = await fetch(`/api/movies?id=${id}&append=videos`);
        const movie = await res.json();
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');

        document.getElementById('m-title').innerText = movie.title;
        document.getElementById('m-desc').innerText = movie.overview;
        document.getElementById('video-area').innerHTML = trailer ? 
            `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : 
            '<div style="padding:60px; text-align:center;">Trailer not available</div>';
    }

    document.getElementById('modal-close').onclick = () => {
        modal.style.display = 'none';
        document.getElementById('video-area').innerHTML = ''; // Stop video
    };

    // --- EVENT LISTENERS ---
    searchBtn.onclick = startAISearch;
    movieInput.onkeypress = (e) => { if(e.key === 'Enter') startAISearch(); };

    loadMoreBtn.onclick = () => {
        currentPage++;
        fetchMovies(currentQuery, currentPage, true);
    };

    // Initial Trending Load
    fetchMovies('trending', 1);
});
