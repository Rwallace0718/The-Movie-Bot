document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const input = document.getElementById('movie-input');
    const btn = document.getElementById('search-btn');

    async function load(query) {
        grid.innerHTML = "<p>Scanning...</p>";
        const res = await fetch(`/api/movies?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        grid.innerHTML = "";
        data.results.forEach(m => {
            if(!m.poster_path) return;
            const d = document.createElement('div');
            d.className = 'card';
            d.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${m.poster_path}">`;
            d.onclick = () => open(m.id);
            grid.appendChild(d);
        });
    }

    async function open(id) {
        document.getElementById('modal').style.display = 'flex';
        const res = await fetch(`/api/movies?id=${id}&append=videos,watch/providers`);
        const m = await res.json();
        document.getElementById('m-title').innerText = m.title;
        document.getElementById('m-desc').innerText = m.overview;
        
        const trailer = m.videos?.results.find(v => v.type === 'Trailer');
        document.getElementById('trailer').innerHTML = trailer ? 
            `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : 'No Trailer';

        const providers = m['watch/providers']?.results?.US?.flatrate || [];
        document.getElementById('streaming').innerHTML = "<strong>Watch on:</strong><br>" + 
            providers.map(p => `<img src="https://image.tmdb.org/t/p/original${p.logo_path}" class="icon">`).join('');
    }

    btn.onclick = async () => {
        btn.innerText = "...";
        const aiRes = await fetch('/api/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: `Recommend 5 movies for: ${input.value}. Titles only, comma separated.` })
        });
        const aiData = await aiRes.json();
        await load(aiData.choices[0].message.content);
        btn.innerText = "Search AI";
    };

    document.getElementById('close').onclick = () => {
        document.getElementById('modal').style.display='none';
        document.getElementById('trailer').innerHTML='';
    }
    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-mode');

    load('trending');
});
