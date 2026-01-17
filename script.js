searchBtn.addEventListener('click', async () => {
    const userInput = document.getElementById('movie-input').value;
    resultsContainer.innerHTML = "<p>AI is thinking...</p>";

    // 1. This part asks OpenAI for a list of movies
    const aiSuggestion = await getAIRecommendation(userInput);
    
    // 2. This part takes those suggestions and finds them on TMDB
    const movies = await searchMovies(aiSuggestion);

    displayResults(movies);
});
        
        const data = await response.json();
        // Returns the text recommendation from OpenAI
        return data.choices[0].message.content;
    } catch (error) {
        console.error("AI Error:", error);
        return userInput; // Fallback to just using the raw input if AI fails
    }
}

// --- 3. THE DISPLAY LOGIC ---
function displayResults(movies) {
    const container = document.getElementById('results-container');
    if (!container) return;

    container.innerHTML = ""; // Clear "Thinking..." or old results

    if (movies.length === 0) {
        container.innerHTML = "<p>No movies found. Try a different search!</p>";
        return;
    }

    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'movie-card';
        // Only show image if path exists
        const poster = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
            : 'https://via.placeholder.com/200x300?text=No+Poster';

        movieDiv.innerHTML = `
            <img src="${poster}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
        `;
        container.appendChild(movieDiv);
    });
}

// --- 4. EVENT LISTENERS (The "Wiring") ---

// A. Search Button
const searchBtn = document.getElementById('search-button');
if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        const inputField = document.getElementById('movie-input');
        const resultsContainer = document.getElementById('results-container');
        
        if (!inputField.value) return alert("Please enter a movie or mood!");

        resultsContainer.innerHTML = "<p class='loading'>AI is thinking of the best movies...</p>";

        // First get AI advice, then search TMDB
        const recommendation = await getAIRecommendation(inputField.value);
        const movies = await searchMovies(recommendation);

        displayResults(movies);
    });
}

// B. Genre Dropdown
const genreDropdown = document.getElementById('genre-dropdown');
if (genreDropdown) {
    genreDropdown.addEventListener('change', async (event) => {
        const selectedGenre = event.target.value;
        if (!selectedGenre) return;
        
        const movies = await searchMovies(selectedGenre);
        displayResults(movies);
    });
}

// C. Light/Dark Toggle
const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        console.log("Theme toggled");
    });
}

