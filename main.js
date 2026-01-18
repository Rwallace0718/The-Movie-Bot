window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const genreDropdown = document.getElementById('genre-dropdown');
    const titleElement = document.getElementById('current-view-title');

    document.getElementById('theme-toggle').onclick = () => {
        document.body.classList.toggle('light-mode');
    };

    async function fetchMovies(query, isGenre = false, isId = false) {
        let url = `/api/movies?query=${encodeURIComponent(query)}`;
        if (isGenre) url = `/api/movies?genre=${query}`;
        if (isId) url = `/api/movies?id=${query}&append=videos,watch/providers`;

        const response = await fetch(url);
        return await response.json();
    }

    async function showMovieDetails(movieId) {
        const movie = await fetchMovies(movieId, false, true);
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer' || v.type === 'Teaser');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button" title="Close">&times;</span>
                ${trailer ? 
                    `<iframe width="100%" height="450" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : 
                    '<div style="padding:40px; text-align:center;">No trailer found.</div>'}
                <div class="modal-info" style="padding:25px; color: white;">
                    <h2 style="margin-top:0;">${movie.title}</h2>
                    <p style="line-height:1.6; opacity:0.9;">${movie.overview}</p>
                    <div style="margin-top:20px;">
                        <h3 style="margin-bottom:10px;">Streaming on:</h3>
                        <div class="provider-logos">
                            ${providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" title="${p.provider_name}">`).join('') || 'Check local listings'}
                        </div>
                    </div>
                </div>
            </div>`;
        
        document.body.appendChild(modal);
        modal.querySelector('.close-button').onclick = () => modal.remove();
        window.onclick = (e) => { if (e.target == modal) modal.remove(); };
    }

    function displayMovies(data) {
        const movies = data.results || data; 
        resultsContainer.innerHTML = "";
        if (!movies || movies.length === 0) {
            resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No movies found.</p>";
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            card.innerHTML = `
                <img src="${poster}" alt="${movie.title}" style="width:100%; border-radius: 10px;">
                <div class="movie-info" style="padding: 15px; text-align:center;">
                    <h3 style="font-size: 1rem; margin-bottom:10px;">${movie.title}</h3>
                    <button class="view-details-btn" style="background: #e50914; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">View Details</button>
                </div>
            `;
            card.querySelector('.view-details-btn').onclick = () => showMovieDetails(movie.id);
            resultsContainer.appendChild(card);
        });
    }

    searchBtn.onclick = async () => {
        const userText = movieInput.value;
        if (!userText) return;
        resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>AI is scanning the multiverse...</p>";
        try {
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });
            const aiData = await aiResponse.json();
            const aiRec = aiData.choices[0].message.content;
            const movieData = await fetchMovies(aiRec);
            displayMovies(movieData);
            titleElement.innerText = "AI Suggests: " + aiRec;
        } catch (err) {
            resultsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Error with AI. Check OpenAI key.</p>";
        }
    };

    genreDropdown.onchange = async (e) => {
        if (!e.target.value) return;
        const movieData = await fetchMovies(e.target.value, true);
        displayMovies(movieData);
        titleElement.innerText = e.target.options[e.target.selectedIndex].text;
    };

    fetchMovies('trending').then(displayMovies);
});
