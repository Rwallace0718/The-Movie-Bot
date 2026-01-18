window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const genreDropdown = document.getElementById('genre-dropdown');
    const titleElement = document.getElementById('current-view-title');

    // 1. THEME TOGGLE
    document.getElementById('theme-toggle').onclick = () => {
        document.body.classList.toggle('light-mode');
    };

    // 2. FETCH LOGIC (Handles Queries, Genres, and Deep Details)
    async function fetchMovies(query, isGenre = false, isId = false) {
        let url = `/api/movies?query=${encodeURIComponent(query)}`;
        if (isGenre) url = `/api/movies?genre=${query}`;
        if (isId) url = `/api/movies?id=${query}&append=videos,watch/providers`;

        const response = await fetch(url);
        return await response.json();
    }

    // 3. MODAL POPUP (This makes movies "Clickable")
    async function showMovieDetails(movieId) {
        const movie = await fetchMovies(movieId, false, true);
        
        const trailer = movie.videos?.results.find(v => v.type === 'Trailer' || v.type === 'Teaser');
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];

        const modal = document.createElement('div');
        modal.className = 'movie-modal'; // Ensure this class is in your style.css
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                ${trailer ? 
                    `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : 
                    '<div style="padding:40px; text-align:center;">No trailer found.</div>'}
                <div class="modal-info" style="padding:20px; color: white;">
                    <h2>${movie.title}</h2>
                    <p>${movie.overview}</p>
                    <div style="margin-top:20px;">
                        <h3>Available on:</h3>
                        <div class="provider-logos">
                            ${providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" title="${p.provider_name}" style="width:45px; margin-right:10px; border-radius:8px;">`).join('') || 'Check local listings'}
                        </div>
                    </div>
                </div>
            </div>`;
        
        document.body.appendChild(modal);
        
        // Close Modal logic
        modal.querySelector('.close-button').onclick = () => modal.remove();
        window.onclick = (e) => { if (e.target == modal) modal.remove(); };
    }

    // 4. DISPLAY LOGIC (Adds the button to each card)
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
                <div class="movie-info" style="padding: 10px; text-align:center;">
                    <h3 style="font-size: 1rem; margin-bottom:10px;">${movie.title}</h3>
                    <button class="view-details-btn" style="background: red; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">View Details</button>
                </div>
            `;

            // Make the button functional
            card.querySelector('.view-details-btn').onclick = () => showMovieDetails(movie.id);
            resultsContainer.appendChild(card);
        });
    }

    // 5. SEARCH LOGIC (AI Recommendation)
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

    // 6. GENRE LOGIC
    genreDropdown.onchange = async (e) => {
        if (!e.target.value) return;
        const movieData = await fetchMovies(e.target.value, true);
        displayMovies(movieData);
        titleElement.innerText = e.target.options[e.target.selectedIndex].text;
    };

    // 7. INITIAL LOAD (Trending)
    fetchMovies('trending').then(displayMovies);
});
