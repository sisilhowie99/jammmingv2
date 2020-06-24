import SearchBar from "../Components/SearchBar/SearchBar";

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
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=CLIENT_I${AppClientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(jsonResponse => {
            if(!jsonResponse.tracks) {
                return [];
            } else {
                return jsonResponse.tracks.items.map(track => {
                    return {
                        id: track.id,
                        name: track.name,
                        artist: track.artist,
                        album: track.album,
                        uri: track.uri
                    };
                });
            }
        })
    }
}

export default Spotify;