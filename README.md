# My Personal Spotify Project

A desktop application built with Electron to interact with the Spotify API, allowing users to search for tracks.

<div style="background-color: white; height: 4px; width: 100%; margin: 20px 0;"></div>

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **Node.js and npm**: This project requires Node.js and its package manager, npm. You can download them from [nodejs.org](https://nodejs.org/).
2.  **Spotify Developer Account & API Credentials**:
    *   You need a Spotify Developer account. If you don't have one, sign up at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
    *   Create an application in your dashboard to obtain a **Client ID** and **Client Secret**. These are essential for API authentication.

## Setup Instructions

1.  **Clone the Repository (if you haven't already)**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
    (If you already have the project files, you can skip this step.)

2.  **Install Dependencies**:
    Navigate to the project's root directory in your terminal and run:
    ```bash
    npm install
    ```
    This command will download and install all necessary packages defined in `package.json`, including Electron and the Spotify Web API wrapper.

3.  **Set Up Spotify API Credentials**:
    This application requires your Spotify Client ID and Client Secret to be available as environment variables. You need to set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.

    You can set them in your terminal session before launching the app. The method varies by operating system:

    *   **Linux/macOS**:
        ```bash
        export SPOTIFY_CLIENT_ID="YOUR_CLIENT_ID_HERE"
        export SPOTIFY_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
        ```

    *   **Windows (Command Prompt)**:
        ```bash
        set SPOTIFY_CLIENT_ID="YOUR_CLIENT_ID_HERE"
        set SPOTIFY_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
        ```

    *   **Windows (PowerShell)**:
        ```bash
        $env:SPOTIFY_CLIENT_ID="YOUR_CLIENT_ID_HERE"
        $env:SPOTIFY_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
        ```
    Replace `"YOUR_CLIENT_ID_HERE"` and `"YOUR_CLIENT_SECRET_HERE"` with your actual credentials.

    **Note**: Environment variables set this way are typically only valid for the current terminal session. For a more permanent solution, consider using a `.env` file with a library like `dotenv` (though this project does not currently implement `dotenv`), or setting them at the system level.

## Running the Application

Once you have completed the setup steps:

1.  Ensure your environment variables (`SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`) are set in your current terminal session.
2.  Run the following command from the project's root directory:
    ```bash
    npm start
    ```
    This will launch the Electron application.

    Alternatively, you can directly use:
    ```bash
    electron .
    ```

## Features

*   **Search Tracks**: Enter a track name in the search bar and click "Search" to find tracks on Spotify.
*   **View Results**: Displays track name, artist(s), album name, album artwork, and a direct link to listen on Spotify.

---
*This project is for educational purposes and demonstrates basic interaction with the Spotify API using Electron.*
