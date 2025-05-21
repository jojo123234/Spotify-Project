const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');

    searchButton.addEventListener('click', async () => {
        resultsDiv.innerHTML = ''; // Clear previous results or messages immediately
        const query = searchInput.value.trim();

        if (!query) {
            resultsDiv.innerHTML = '<p style="color: orange;">Please enter a search term.</p>';
            return;
        }

        resultsDiv.innerHTML = `<p>Searching for "${query}"...</p>`; // Show searching message

        try {
            console.log(`Sending search query to main process: "${query}"`);
            const result = await ipcRenderer.invoke('spotify-api-request', 'searchTracks', query);
            console.log('Received result from main process:', result);

            resultsDiv.innerHTML = ''; // Clear "Searching..." message before displaying results or errors

            if (result.error) {
                // Display error message from main process
                let errorMessage = `Error: ${result.error}`;
                if (result.details) {
                    errorMessage += ` (Details: ${result.details})`;
                }
                resultsDiv.innerHTML = `<p style="color: red;">${errorMessage}</p>`;
                console.error(`Received error from main process: ${result.error}`, result.details || '');
            } else if (result.tracks && result.tracks.length > 0) {
                const trackList = result.tracks.map(track => {
                    const artists = track.artists.map(artist => artist.name).join(', ');
                    // Use the smallest available album image, or a placeholder
                    const imageUrl = track.album.images.length ? track.album.images[track.album.images.length - 1].url : 'https://via.placeholder.com/64?text=No+Image';
                    return `
                        <div class="track">
                            <img src="${imageUrl}" alt="${track.name}" width="64" height="64" style="float:left; margin-right:10px; border-radius:4px;">
                            <strong>${track.name}</strong><br>
                            By: ${artists}<br>
                            Album: ${track.album.name}<br>
                            <a href="${track.external_urls.spotify}" target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
                            <div style="clear:both;"></div>
                        </div>
                    `;
                }).join('');
                resultsDiv.innerHTML = trackList;
            } else if (result.tracks && result.tracks.length === 0) {
                // More user-friendly "no tracks found" message
                resultsDiv.innerHTML = `<p>No tracks found for "<strong>${query}</strong>". Try different keywords or check your spelling.</p>`;
            } else {
                // Handle unexpected structure if result.error and result.tracks are both missing
                resultsDiv.innerHTML = '<p style="color: orange;">Received an unexpected response from the application. Please try again.</p>';
                console.warn("Unexpected result structure from main process:", result);
            }
        } catch (error) {
            // This catches errors from ipcRenderer.invoke itself (e.g., if main process is unreachable or IPC mechanism fails)
            console.error('Error invoking spotify-api-request via IPC:', error);
            resultsDiv.innerHTML = ''; // Clear "Searching..." message
            resultsDiv.innerHTML = `<p style="color: red;">A critical error occurred while trying to search: ${error.message}. Please try restarting the application.</p>`;
        }
    });

    // Optional: Allow search on Enter key press in the input field
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});
