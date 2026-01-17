// Replace your old TMDB fetch with this:
async function searchMovies(title) {
    // We call OUR server, which has the key hidden!
    const response = await fetch(`/api/movies?query=${encodeURIComponent(title)}`);
    const data = await response.json();
    return data.results; 
}
// If they are missing (locally), the app will prompt you or fail gracefully
if (!TMDB_KEY || !OPENAI_KEY) {
    console.error("API Keys are missing. Make sure they are set in Vercel!");
}
// Rest of your code...
let currentPage = 1;
let currentQuery = '';
let allResults = [];
let searchMode = 'text'; // 'text', 'genre', or 'ai'

// --- 1. THEME TOGGLE & STARS ---
document.getElementById('theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    document.getElementById('theme-toggle').innerText = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
    
    if (newTheme === 'dark') {
        createStars();
    } else {
        document.getElementById('star-container').innerHTML = '';
    }
});

function createStars() {
    const container = document.getElementById('star-container');
    container.innerHTML = '';
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 2 + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        star.style.setProperty('--drift-duration', (Math.random() * 60 + 40) + 's');
        container.appendChild(star);
    }
}

// --- 2. SEARCH & GENRE TRIGGERS ---
document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    currentQuery = query;
    currentPage = 1;
    allResults = [];
    document.getElementById('movie-grid').innerHTML = '';
    document.getElementById('genre-dropdown').value = ''; // Reset dropdown
    
    if (query.split(' ').length > 3) {
        searchMode = 'ai';
        getAIRecommendations(query);
    } else {
        searchMode = 'text';
        fetchMovies();
    }
});

document.getElementById('genre-dropdown').addEventListener('change', (e) => {
    const genreId = e.target.value;
    if (!genreId) return;

    currentQuery = genreId;
    currentPage = 1;
    allResults = [];
    searchMode = 'genre';
    document.getElementById('search-input').value = ''; // Reset input
    document.getElementById('movie-grid').innerHTML = '';
    fetchMovies();
});

// --- 3. DATA FETCHING ---
async function fetchMovies() {
    let url = '';
    const apiPage = Math.ceil((currentPage * 12) / 20); // Syncs our 12-card view with TMDB's 20-card page

    if (searchMode === 'genre') {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=${currentQuery}&page=${apiPage}`;
    } else {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(currentQuery)}&page=${apiPage}`;
    }

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        
        // Add new results only if they aren't already in the list
        const newMovies = data.results.filter(m => !allResults.find(existing => existing.id === m.id));
        allResults = [...allResults, ...newMovies];
        
        displayMovies();
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

async function getAIRecommendations(prompt) {
    document.getElementById('movie-grid').innerHTML = '<p style="text-align:center; width:100%;">The Bot is thinking...</p>';
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{role: "system", content: "Return a comma-separated list of 24 movie titles based on the user request. No numbers."}, {role: "user", content: prompt}]
            })
        });
        const data = await response.json();
        const titles = data.choices[0].message.content.split(',');
        
        for (let title of titles) {
            const movie = await fetchMovieByTitle(title.trim());
            if (movie) allResults.push(movie);
        }
        document.getElementById('movie-grid').innerHTML = '';
        displayMovies();
    } catch (err) {
        console.error("AI Error:", err);
    }
}

async function fetchMovieByTitle(title) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data.results ? data.results[0] : null;
}

// --- 4. DISPLAY LOGIC ---
function displayMovies() {
    const grid = document.getElementById('movie-grid');
    const start = (currentPage - 1) * 12;
    const end = start + 12;
    const slice = allResults.slice(start, end);

    slice.forEach(movie => {
        if (!movie.poster_path) return;
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info"><h3>${movie.title}</h3></div>
        `;
        card.onclick = () => showDetails(movie.id);
        grid.appendChild(card);
    });

    // Check if we should show the "Load More" button
    const loadMoreBtn = document.getElementById('load-more');
    if (allResults.length > end || (searchMode !== 'ai' && allResults.length >= 12)) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

document.getElementById('load-more').addEventListener('click', () => {
    currentPage++;
    // If we are getting close to running out of movies in our local list, fetch more from API
    if (allResults.length <= currentPage * 12 && searchMode !== 'ai') {
        fetchMovies();
    } else {
        displayMovies();
    }
});

// --- 5. MODAL / POPUP ---
async function showDetails(id) {
    const vUrl = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${TMDB_KEY}`;
    const wUrl = `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${TMDB_KEY}`;
    const [vR, wR] = await Promise.all([fetch(vUrl), fetch(wUrl)]);
    const vData = await vR.json();
    const wData = await wR.json();
    
    const trailer = vData.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    const providers = wData.results?.US?.flatrate || [];

    const pHTML = providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" class="provider-logo" title="${p.provider_name}">`).join('');
    
    document.getElementById('modal-body').innerHTML = `
        ${trailer ? `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : '<p>No Trailer Available</p>'}
        <h2 style="margin-top:20px;">Where to Stream (US)</h2>
        <div style="display:flex; flex-wrap:wrap; justify-content:center;">${pHTML || 'Not found on subscription streaming.'}</div>
    `;
    document.getElementById('movie-modal').style.display = 'block';
}

document.querySelector('.close-modal').onclick = () => {
    document.getElementById('movie-modal').style.display = 'none';
};

window.onclick = (e) => {
    if (e.target.className === 'modal') document.getElementById('movie-modal').style.display = 'none';
};



