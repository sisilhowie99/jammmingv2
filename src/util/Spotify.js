let userAccessToken;

const AppClientId = 'bc57bcfb80b54045ab858cc014e7c879';
const redirectUri = 'http://localhost:3000/';

const Spotify = {
    getAccessToken() {
        if(userAccessToken) {
            return userAccessToken;
        }
        
        //check for access token match
        const accessToken = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if(accessToken && expiresInMatch) {
            userAccessToken = accessToken[1];
            const expiresIn = Number(expiresInMatch[1]);

            //to clear parameter from the URL once the access token expires so the app doesn't grab expired token
            window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${AppClientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }
    },

    async search(term) {
        const accessToken = Spotify.getAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const jsonResponse = await response.json();
        if (!jsonResponse.tracks) {
            return [];
        }
        else {
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artist,
                album: track.album,
                uri: track.uri
            }));
        }
    },

    async savePlaylist(playlistName, arrOfUris) {
        if(!playlistName || !arrOfUris.length) {
            return;
        };
        
        const accessToken = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userId;
        
        const response = await fetch('https://api.spotify.com/v1/me', { headers: headers });
        const jsonResponse = await response.json();
        userId = jsonResponse.id;
        const response_1 = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({ name: playlistName })
        });
        const jsonResponse_1 = await response_1.json();
        const playlistID = jsonResponse_1.id;
        const response_2 = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({ uris: arrOfUris })
        });
        const jsonResponse_2 = await response_2.json();
        const playlistID_1 = jsonResponse_2.id;
        return playlistID_1;


    }
}

export default Spotify;