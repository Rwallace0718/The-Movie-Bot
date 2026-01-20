document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const themeToggle = document.getElementById('theme-toggle');
    const modal = document.getElementById('movie-modal');

    themeToggle.onclick = () => document.body.classList.toggle('light-mode');

    async function fetchMovies(query, append = false) {
        if (!append) resultsContainer.innerHTML = "<p style='grid-column:1/-1;text-align:center;'>Searching...</p>";
        // Cache Buster added: Date.now()
        const url = `/api/movies?query=${encodeURIComponent(query)}&cb=${Date.now()}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (!append) resultsContainer.innerHTML = "";
            data.results.forEach(movie => {
                if(!movie.poster_path) return;
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"><div class="card-content"><h3>${movie.title}</h3></div>`;
                card.onclick = () => openModal(movie.id);
                resultsContainer.appendChild(card);
            });
        } catch (e) { console.error(e); }
    }

    async function openModal(id) {
        modal.style.display = 'flex';
        document.getElementById('video-area').innerHTML = '<p style="text-align:center;color:white;padding-top:20%;">Loading...</p>';
        
        // Fetch details, videos, and watch providers
        const res = await fetch(`/api/movies?id=${id}&append=videos,watch/providers&cb=${Date.now()}`);
        const movie = await res.json();
        
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        document.getElementById('m-title').innerText = movie.title;
        document.getElementById('m-desc').innerText = movie.overview;
        
        // Trailer
        document.getElementById('video-area').innerHTML = trailer ? 
            `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : 
            '<div style="padding:40px;color:gray;text-align:center;">Trailer not available</div>';

        // Streaming Providers
        const streamDiv = document.createElement('div');
        streamDiv.className = 'streaming-row';
        streamDiv.innerHTML = providers.length > 0 ? 
            '<strong>Watch on:</strong> ' + providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" class="provider-icon" title="${p.provider_name}">`).join('') :
            '<p style="font-size:0.8rem;color:gray;">No streaming data for US</p>';
        
        const existingRow = document.querySelector('.streaming-row');
        if(existingRow) existingRow.remove();
        document.querySelector('.details-box').appendChild(streamDiv);
    }

    document.getElementById('modal-close').onclick = () => {
        modal.style.display = 'none';
        document.getElementById('video-area').innerHTML = '';
    };

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        searchBtn.innerText = "Thinking...";
        try {
            const aiRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Suggest 5 movie titles for: ${val}. Titles only, comma separated.` })
            });
            const aiData = await aiRes.json();
            await fetchMovies(aiData.choices[0].message.content);
        } catch (e) { await fetchMovies(val); }
        searchBtn.innerText = "Search AI";
    };

    fetchMovies('trending');
});
