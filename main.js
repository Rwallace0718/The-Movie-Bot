document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const themeToggle = document.getElementById('theme-toggle');

    let currentPage = 1;
    let currentQuery = 'trending';

    // 1. THEME TOGGLE (FORCED)
    themeToggle.onclick = (e) => {
        e.preventDefault();
        document.body.classList.toggle('light-mode');
        console.log("Theme Toggled");
    };

    // 2. FETCH FUNCTION
    async function fetchMovies(query, page = 1, append = false) {
        if (!append) resultsContainer.innerHTML = "<div style='grid-column: 1/-1; text-align:center;'>Scanning Cinema Database...</div>";
        
        try {
            const res = await fetch(`/api/movies?query=${encodeURIComponent(query)}&page=${page}`);
            const data = await res.json();
            
            if (!append) resultsContainer.innerHTML = "";
            
            data.results.forEach(movie => {
                if(!movie.poster_path) return;
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.innerHTML = `
                    <div class="poster-container">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                    </div>
                    <div class="card-content"><h3>${movie.title}</h3></div>
                `;
                card.onclick = () => openModal(movie.id);
                resultsContainer.appendChild(card);
            });

            loadMoreBtn.style.display = (data.total_pages > page) ? "inline-block" : "none";
        } catch (e) { 
            resultsContainer.innerHTML = "Error fetching movies. Check API.";
        }
    }

    // 3. AI SEARCH (FORCED RECOMMENDER)
    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        
        searchBtn.innerText = "Consulting AI...";
        
        try {
            const aiRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: `You are a movie expert. Based on the user's vibe: "${val}", provide 5-8 specific movie titles. Return ONLY the titles separated by commas. No extra text.` 
                })
            });
            const aiData = await aiRes.json();
            currentQuery = aiData.choices[0].message.content;
            console.log("AI Recommendations:", currentQuery);
        } catch (e) { 
            currentQuery = val; 
        }

        currentPage = 1;
        await fetchMovies(currentQuery, 1, false);
        searchBtn.innerText = "Search AI";
        document.getElementById('current-view-title').innerText = "Vibe: " + val;
    };

    // 4. LOAD MORE
    loadMoreBtn.onclick = () => {
        currentPage++;
        fetchMovies(currentQuery, currentPage, true);
    };

    // 5. MODAL LOGIC
    async function openModal(id) {
        const modal = document.getElementById('movie-modal');
        modal.style.display = 'flex';
        const res = await fetch(`/api/movies?id=${id}&append=videos`);
        const movie = await res.json();
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');

        document.getElementById('m-title').innerText = movie.title;
        document.getElementById('m-desc').innerText = movie.overview;
        document.getElementById('video-area').innerHTML = trailer ? 
            `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : 
            '<p style="padding:40px; text-align:center; color:#fff;">Trailer not available</p>';
    }

    document.getElementById('modal-close').onclick = () => {
        document.getElementById('movie-modal').style.display = 'none';
        document.getElementById('video-area').innerHTML = '';
    };

    // Auto-load Trending
    fetchMovies('trending', 1);
});
