document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const modal = document.getElementById('movie-modal');

    let currentPage = 1;
    let currentQuery = 'trending';

    themeToggle.onclick = () => document.body.classList.toggle('light-mode');

    async function fetchMovies(query, page = 1, append = false) {
        if (!append) resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Consulting the AI Cinema Oracle...</p>";
        
        try {
            const res = await fetch(`/api/movies?query=${encodeURIComponent(query)}&page=${page}`);
            const data = await res.json();
            
            if (!append) resultsContainer.innerHTML = "";
            
            data.results.forEach(movie => {
                if(!movie.poster_path) return;
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
                    <div class="card-content"><h3>${movie.title}</h3></div>
                `;
                card.onclick = () => openModal(movie.id);
                resultsContainer.appendChild(card);
            });

            loadMoreBtn.style.display = (data.total_pages > page) ? "inline-block" : "none";
        } catch (e) { console.error("Database Error"); }
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        
        searchBtn.innerText = "Thinking...";
        
        try {
            // STEP 1: Ask AI for recommendations
            const aiRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Based on the vibe "${val}", suggest 5-8 movie titles. Return ONLY titles, comma-separated.` })
            });
            const aiData = await aiRes.json();
            currentQuery = aiData.choices[0].message.content;
            
            // STEP 2: Search the database for those titles
            currentPage = 1;
            await fetchMovies(currentQuery, 1, false);
            document.getElementById('current-view-title').innerText = "AI Vibe: " + val;
        } catch (e) {
            // Fallback if AI fails
            currentQuery = val;
            await fetchMovies(val, 1, false);
        } finally {
            searchBtn.innerText = "Search AI";
        }
    };

    async function openModal(id) {
        modal.style.display = 'flex';
        document.getElementById('video-area').innerHTML = '<p style="text-align:center; padding-top:20%;">Loading Trailer...</p>';
        
        const res = await fetch(`/api/movies?id=${id}&append=videos`);
        const movie = await res.json();
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');

        document.getElementById('m-title').innerText = movie.title;
        document.getElementById('m-desc').innerText = movie.overview;
        document.getElementById('video-area').innerHTML = trailer ? 
            `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : 
            '<div style="padding:40px; text-align:center;">Trailer not available</div>';
    }

    document.getElementById('modal-close').onclick = () => {
        modal.style.display = 'none';
        document.getElementById('video-area').innerHTML = '';
    };

    loadMoreBtn.onclick = () => {
        currentPage++;
        fetchMovies(currentQuery, currentPage, true);
    };

    // Auto-load Trending on first visit
    fetchMovies('trending', 1);
});
