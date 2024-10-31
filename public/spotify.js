const clientId = '715b31edaba542f3b7458ce1d7253e94';
const clientSecret = 'dadf2ef76b14476f9c707088f5f9831a';

async function getSpotifyAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

async function fetchSpotifyPreview(artist, song) {
    try {
        const accessToken = await getSpotifyAccessToken();
        const query = `${artist} ${song}`;
        
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const data = await response.json();

        if (data.tracks.items.length > 0) {
            const track = data.tracks.items[0];
            return {
                audio: track.preview_url,
                image: track.album.images[0].url
            };
        } else {
            return { audio: '', image: '' };
        }
    } catch (error) {
        console.error('Error fetching song preview:', error);
        return { audio: '', image: '' };
    }
}
