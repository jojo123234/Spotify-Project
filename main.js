const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const SpotifyWebApi = require('spotify-web-api-node');

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('CRITICAL: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables must be set for the application to function correctly with Spotify.');
}

// Function to retrieve and refresh the access token
async function retrieveAccessToken() {
    console.log('Attempting to retrieve Spotify access token...');
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        console.error('Cannot retrieve token: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables are not set.');
        throw new Error('Spotify API credentials are not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.');
    }
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        const accessToken = data.body['access_token'];
        const expiresIn = data.body['expires_in']; // Typically 3600 seconds

        spotifyApi.setAccessToken(accessToken);
        console.log('Spotify access token retrieved successfully!');
        console.log('Token expires in:', expiresIn, 'seconds');

        const refreshTimeout = (expiresIn - 300) * 1000;
        if (refreshTimeout > 0) {
            setTimeout(retrieveAccessToken, refreshTimeout);
            console.log(`Scheduled next token refresh in approximately ${(refreshTimeout / (1000 * 60)).toFixed(1)} minutes.`);
        } else {
            console.warn(`Token expiry is very short (${expiresIn}s). Refresh will be scheduled for when it expires.`);
            setTimeout(retrieveAccessToken, expiresIn * 1000);
        }

    } catch (err) {
        console.error('Error retrieving Spotify access token:', err.message || err);
        console.log('Retrying token retrieval in 1 minute...');
        setTimeout(retrieveAccessToken, 60 * 1000);
        throw err; // Re-throw to be caught by callers
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile('renderer/index.html');
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();
    if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
        retrieveAccessToken().catch(err => {
            console.error("Initial Spotify token retrieval failed:", err.message);
            // This error is critical for Spotify functionality.
            // Consider notifying the user in the renderer process if the app starts but Spotify is unusable.
        });
    } else {
        console.warn("Spotify API credentials (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET) are not set. Spotify features will be unavailable.");
    }
});

ipcMain.handle('spotify-api-request', async (event, action, ...params) => {
    console.log(`Received Spotify API request: ${action} with params:`, params);

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        console.error('Spotify API credentials are not set.');
        return { error: 'Spotify API credentials are not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables to use Spotify features.' };
    }

    if (!spotifyApi.getAccessToken()) {
        console.log('Access token missing. Attempting to retrieve...');
        try {
            await retrieveAccessToken();
            if (!spotifyApi.getAccessToken()) {
                console.error('Failed to retrieve access token even after attempt.');
                return { error: 'Failed to initialize Spotify session. Please check main process logs.' };
            }
            console.log('Access token retrieved. Proceeding with API request.');
        } catch (error) {
            console.error('Error during on-demand token retrieval:', error.message);
            return { error: 'Failed to retrieve Spotify access token. Please ensure credentials are correct and network is available.', details: error.message };
        }
    }

    switch (action) {
        case 'searchTracks':
            const query = params[0];
            if (!query || typeof query !== 'string' || query.trim() === '') {
                return { error: 'Invalid search query. Please enter a valid term.' };
            }
            try {
                console.log(`Searching Spotify for tracks with query: "${query}"`);
                const response = await spotifyApi.searchTracks(query);
                if (response && response.body && response.body.tracks) {
                    console.log(`Found ${response.body.tracks.items.length} tracks for query "${query}".`);
                    return { tracks: response.body.tracks.items };
                } else {
                    console.error('Unexpected response structure from Spotify API search:', response);
                    return { error: 'Received an unexpected response from Spotify. Please try again.' };
                }
            } catch (e) {
                console.error(`Error calling Spotify searchTracks API for query "${query}":`, e.message || e);
                if (e.statusCode === 401) {
                    console.log('Spotify token unauthorized/expired. Attempting refresh and retry...');
                    try {
                        await retrieveAccessToken();
                        const retryResponse = await spotifyApi.searchTracks(query);
                        if (retryResponse && retryResponse.body && retryResponse.body.tracks) {
                            return { tracks: retryResponse.body.tracks.items };
                        } else {
                            return { error: 'Failed to search Spotify tracks after token refresh. Please try again.' };
                        }
                    } catch (refreshError) {
                        console.error('Token refresh or retry failed:', refreshError.message);
                        return { error: 'Failed to communicate with Spotify API after a token issue. Please try again later.', details: refreshError.message };
                    }
                }
                // General API error
                return { error: 'Failed to communicate with Spotify API. Please check your connection or try again later.', details: e.message || e.toString() };
            }
        default:
            console.warn(`Unknown action received: ${action}`);
            return { error: `Unknown action: ${action}. Please contact support if this persists.` };
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
