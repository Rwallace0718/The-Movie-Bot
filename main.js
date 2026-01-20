document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const movieInput = document.getElementById('movie-input');
    const searchBtn = document.getElementById('search-button');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const themeToggle = document.getElementById('theme-toggle');

    let currentPage = 1;
    let currentQuery = 'trending';

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });

    async function fetchMovies(query, page = 1, append = false) {
        if (!append) resultsContainer.innerHTML = "<p style='text-align:center;'>Loading...</p>";
        
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
        } catch (e) { console.error(e); }
    }

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
            '<p style="padding:40px; color:white;">Trailer not available</p>';
    }

    document.getElementById('modal-close').onclick = () => {
        document.getElementById('movie-modal').style.display = 'none';
        document.getElementById('video-area').innerHTML = '';
    };

    searchBtn.onclick = async () => {
        const val = movieInput.value.trim();
        if(!val) return;
        searchBtn.innerText = "...";
        
        // AI Logic
        try {
            const aiRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Suggest 5 movie titles for: ${val}. Titles only, comma separated.` })
            });
            const aiData = await aiRes.json();
            currentQuery = aiData.choices[0].message.content;
        } catch (e) { currentQuery = val; }

        currentPage = 1;
        await fetchMovies(currentQuery, 1, false);
        searchBtn.innerText = "Search AI";
        document.getElementById('current-view-title').innerText = "Results for: " + val;
    };

    loadMoreBtn.onclick = () => {
        currentPage++;
        fetchMovies(currentQuery, currentPage, true);
    };

    fetchMovies('trending', 1);
});
