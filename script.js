/* 1. THEME VARIABLES */
:root {
    --bg-color: #ffffff;
    --text-color: #1a1a1a;
    --card-bg: #f8f8f8;
    --accent: #e50914; /* Movie Bot Red */
    --font-main: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

[data-theme="dark"] {
    --bg-color: #05070a;
    --text-color: #ffffff;
    --card-bg: #161b22;
}

/* 2. CORE STYLES */
body {
    margin: 0;
    padding: 0;
    font-family: var(--font-main);
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background 0.4s ease, color 0.4s ease;
    overflow-x: hidden;
}

/* 3. ANIMATED STARRY BACKGROUND (Dark Mode Only) */
#star-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background: radial-gradient(circle at center, #1B2735 0%, #05070a 100%);
    display: none; /* Hidden by default */
    overflow: hidden;
}

[data-theme="dark"] #star-container {
    display: block; /* Shows only in dark mode */
}

.star {
    position: absolute;
    background: white;
    border-radius: 50%;
    opacity: 0.5;
    animation: twinkle var(--duration) infinite ease-in-out, 
               drift var(--drift-duration) linear infinite;
}

@keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
}

@keyframes drift {
    from { transform: translateY(0); }
    to { transform: translateY(-100vh); }
}

/* 4. HEADER & LOGO */
header {
    padding: 20px;
    text-align: center;
}

.header-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

#theme-toggle {
    padding: 10px 15px;
    border-radius: 20px;
    border: 1px solid var(--accent);
    background: transparent;
    color: var(--text-color);
    cursor: pointer;
    font-weight: bold;
}

.main-logo {
    display: block;
    margin: 20px auto 40px auto;
    max-width: 600px;
    width: 90%;
    height: auto;
    filter: drop-shadow(0px 0px 8px rgba(229, 9, 20, 0.4));
}

/* 5. SEARCH BOX & DROPDOWN */
.search-box {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 40px;
}

#genre-dropdown, #search-input {
    padding: 14px 20px;
    border-radius: 30px;
    border: 2px solid var(--accent);
    background: var(--bg-color);
    color: var(--text-color);
    outline: none;
    font-size: 1rem;
}

#search-input {
    width: 350px;
}

#search-btn {
    padding: 14px 30px;
    border-radius: 30px;
    background-color: var(--accent);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
    font-size: 1rem;
    transition: transform 0.2s;
}

#search-btn:hover {
    transform: scale(1.05);
}

/* 6. MOVIE GRID & CARDS */
#movie-grid {
    display: grid;
    /* Configured for 4 cards per row on wide screens, 12 total looks best */
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 30px;
    padding: 0 40px;
    max-width: 1400px;
    margin: 0 auto;
}

.movie-card {
    background: var(--card-bg);
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.movie-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.3);
}

.movie-card img {
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    display: block;
}

.movie-info {
    padding: 15px;
    text-align: center;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.movie-info h3 {
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.3;
    /* Limits title to 2 lines so posters stay aligned */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;  
    overflow: hidden;
}

/* 7. LOAD MORE SECTION (Centered Fix) */
.load-more-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 60px 0;
}

#load-more {
    padding: 16px 45px;
    font-size: 1.1rem;
    background-color: var(--accent);
    color: white;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 20px rgba(229, 9, 20, 0.4);
    transition: background 0.3s, transform 0.2s;
}

#load-more:hover {
    background-color: #b20710;
    transform: scale(1.05);
}

/* 8. MODAL (Popup) */
.modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.95);
    backdrop-filter: blur(5px);
}

.modal-content {
    background-color: var(--card-bg);
    margin: 50px auto;
    padding: 30px;
    width: 90%;
    max-width: 800px;
    border-radius: 20px;
    position: relative;
}

.close-modal {
    position: absolute;
    right: 25px;
    top: 15px;
    font-size: 40px;
    color: var(--accent);
    cursor: pointer;
}

.provider-logo {
    width: 65px;
    height: 65px;
    margin: 10px;
    border-radius: 12px;
}
