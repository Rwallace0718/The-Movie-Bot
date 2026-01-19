window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const modal = document.getElementById('movie-modal');

    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-mode');

    async function fetchMovies(query, mode = 'search') {
        let url = `/api/movies?query=${encodeURIComponent(query || 'trending')}`;
        if (mode === 'id') url = `/api/movies?id=${query}&append=videos,watch/providers`;
        
        try {
            const res = await fetch(url);
            return await res.json();
        } catch(e) { return { results: [] }; }
    }

    async function openModal(movieId) {
        modal.style.display = 'flex';
        document.getElementById('video-area').innerHTML = '<p style="color:white;text-align:center;padding-top:20%;">Loading Trailer...</p>';
        
        const movie = await fetchMovies(movieId, 'id');
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        // Fill Modal
        document.getElementById('m-title').innerText = movie.title;
        document.getElementById('m-desc').innerText = movie.overview;
        document.getElementById('video-area').innerHTML = trailer ? 
            `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : 
            '<div style="padding:50px;color:gray;text-align:center;">Trailer not available</div>';
        
        const streamDiv = document.getElementById('m-streaming');
        streamDiv.innerHTML = providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" title="${p.provider_name}" style="width:35px;border-radius:5px;">`).join('');
    }

    document.getElementById('modal-close').onclick = () => {
        modal.style.display = 'none';
        document.getElementById('video-area').innerHTML = ''; // Stop video
    };

    function displayMovies(data) {
        resultsContainer.innerHTML = "";
        (data.results || []).forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const img = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            
            card.innerHTML = `
                <div class="poster-container"><img src="${img}"></div>
                <div class="card-content"><h3>${movie.title}</h3></div>
            `;
            card.onclick = () => openModal(movie.id);
            resultsContainer.appendChild(card);
        });
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        searchBtn.innerText = "...";
        
        // Step 1: Ask AI for keywords
        let keywords = val;
        try {
            const ai = await fetch('/api/chat', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ message: `Reply with only 3 search terms for: ${val}` }) 
            });
            if(ai.ok) {
                const aiData = await ai.json();
                keywords = aiData.choices[0].message.content;
            }
        } catch(e) {}

        // Step 2: Search Movies
        const data = await fetchMovies(keywords);
        displayMovies(data);
        searchBtn.innerText = "Search AI";
        document.getElementById('current-view-title').innerText = "Results for: " + val;
    };

    // Initial Load
    fetchMovies('trending').then(displayMovies);
});
