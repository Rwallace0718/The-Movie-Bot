window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const genreDropdown = document.getElementById('genre-dropdown');
    const modal = document.getElementById('movie-modal');

    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-mode');

    async function fetchMovies(query, mode = 'search') {
        let url = `/api/movies?query=${encodeURIComponent(query || 'trending')}`;
        if (mode === 'genre') url = `/api/movies?genre=${query}`;
        if (mode === 'id') url = `/api/movies?id=${query}&append=videos`;
        
        try {
            const res = await fetch(url);
            return await res.json();
        } catch(e) { return { results: [] }; }
    }

    async function openModal(movieId) {
        modal.style.display = 'flex';
        document.getElementById('video-area').innerHTML = '<p style="color:white;text-align:center;padding:10% 0;">Loading...</p>';
        
        const movie = await fetchMovies(movieId, 'id');
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer');

        document.getElementById('m-title').innerText = movie.title;
        document.getElementById('m-desc').innerText = movie.overview;
        document.getElementById('video-area').innerHTML = trailer ? 
            `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : 
            '<div style="padding:40px;text-align:center;">No trailer available</div>';
    }

    document.getElementById('modal-close').onclick = () => { modal.style.display = 'none'; document.getElementById('video-area').innerHTML = ''; };

    function displayMovies(data) {
        resultsContainer.innerHTML = "";
        (data.results || []).forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const img = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750';
            
            card.innerHTML = `<img src="${img}"><div class="card-content"><h3>${movie.title}</h3></div>`;
            card.onclick = () => openModal(movie.id);
            resultsContainer.appendChild(card);
        });
    }

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        searchBtn.innerText = "Thinking...";
        
        // BETTER AI PROMPT: This asks for 5 movie titles based on the vibe
        let searchQuery = val;
        try {
            const ai = await fetch('/api/chat', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ message: `Based on the vibe "${val}", list 5 movies. Return only the movie titles separated by commas.` }) 
            });
            if(ai.ok) {
                const aiData = await ai.json();
                searchQuery = aiData.choices[0].message.content;
            }
        } catch(e) {}

        const data = await fetchMovies(searchQuery);
        displayMovies(data);
        searchBtn.innerText = "Search AI";
        document.getElementById('current-view-title').innerText = "Vibe Results: " + val;
    };

    genreDropdown.onchange = async (e) => {
        const gid = e.target.value;
        if(!gid) return;
        const data = await fetchMovies(gid, 'genre');
        displayMovies(data);
        document.getElementById('current-view-title').innerText = e.target.options[e.target.selectedIndex].text;
    };

    // Initial Trending Load
    fetchMovies('').then(displayMovies);
});
