<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Movie Bot</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="top-bar">
            <button id="theme-toggle">🌓 Toggle Theme</button>
        </div>
    </header>

    <main>
        <div class="hero-section">
            <img src="logo_header.svg" alt="Logo" class="main-logo">
            <div class="search-container">
                <div class="search-box">
                    <input type="text" id="movie-input" placeholder="Search a mood...">
                    <button id="search-button">Search AI</button>
                </div>
                <div class="filter-box">
                    <select id="genre-dropdown">
                        <option value="">-- Select Genre --</option>
                        <option value="28">Action</option>
                        <option value="35">Comedy</option>
                        <option value="27">Horror</option>
                        <option value="18">Drama</option>
                        <option value="878">Sci-Fi</option>
                    </select>
                </div>
            </div>
        </div>
        <h2 id="current-view-title" style="text-align:center;">Trending</h2>
        <div id="results-container"></div>
    </main>

    <script src="main.js"></script>
</body>
</html>
    loadInitialContent();
});

