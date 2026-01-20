document.addEventListener('DOMContentLoaded', () => {
    const results = document.getElementById('results-container');
    const input = document.getElementById('movie-input');
    const btn = document.getElementById('search-button');

    // 1. AI RECOMMENDATION LOGIC
    btn.onclick = async () => {
        const val = input.value.trim();
        if(!val) return;
        btn.innerText = "...";
        
        try {
            const ai = await fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: `Suggest 5 movie titles for the vibe: ${val}. Titles only, comma separated.` })
            });
            const aiData = await ai.json();
            const titles = aiData.choices[0].message.content;
            
            // Search TMDB for those titles
            const res = await fetch(`/api/movies?query=${encodeURIComponent(titles)}`);
            const data = await res.json();
            render(data.results);
        } catch (e) { console.error(e); }
        btn.innerText = "Search AI";
    };

    // 2. WATCH PROVIDERS LOGIC
    async function openModal(id) {
        const modal = document.getElementById('movie-modal');
        modal.style.display = 'flex';
        
        const res = await fetch(`/api/movies?id=${id}&append=videos,watch/providers`);
        const movie = await res.json();
        
        document.getElementById('m-title').innerText = movie.title;
        document.getElementById('m-desc').innerText = movie.overview;
        
        // Render Streaming Icons
        const providers = movie['watch/providers']?.results?.US?.flatrate || [];
        const logoDiv = document.getElementById('streaming-logos');
        logoDiv.innerHTML = providers.map(p => 
            `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" class="provider-img" title="${p.provider_name}">`
        ).join('');
    }

    function render(list) {
        results.innerHTML = "";
        list.forEach(m => {
            if(!m.poster_path) return;
            const div = document.createElement('div');
            div.className = 'movie-card';
            div.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${m.poster_path}">`;
            div.onclick = () => openModal(m.id);
            results.appendChild(div);
        });
    }

    document.getElementById('modal-close').onclick = () => document.getElementById('movie-modal').style.display='none';
    
    // Initial load
    fetch('/api/movies?query=trending').then(r => r.json()).then(d => render(d.results));
});
