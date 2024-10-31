const endpoint = "https://6c2ed68fed824a629b2aac6d178af637.us-central1.gcp.cloud.es.io:443";
const apiKey = "UmlOUTRKSUJlWnMtR0JnYWhPMXg6WXB6elVyT3hUZENJQXJhSVJ3ZjNBQQ==";
const endpoint1 = 'http://localhost:5000/api/search';

document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
    await searchSongs(query);
});

async function searchSongs(query) {
    const response = await fetch(`${endpoint1}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `ApiKey ${apiKey}`,
        },
        body: JSON.stringify({
            "query": {
                "bool": {
                    "should": [
                        { "match": { "song": { "query": query, "boost": 3 } } },
                        { "match": { "artist": { "query": query, "boost": 2 } } },
                        { "match_phrase": {"text": {"query":query, "boost":10} }},
                        { "multi_match": {
                            "query": query,
                            "fields": ["text"],
                            "fuzziness": "AUTO",
                            boost: 4
                        }}
                    ]
                }
            }
        
    })
});

    if (response.ok) {
        const data = await response.json();
        displayResults(data.hits.hits);
    } else {
        console.error('Search failed:', response.statusText);
    }
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; 

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
    }

    results.forEach(async result => {
        const songData = result._source;
        const previewUrl = await fetchSpotifyPreview(songData.artist, songData.song);

        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';

        resultElement.innerHTML = `
            <img src="${previewUrl.image}" alt="${songData.song}">
            <strong>${songData.artist} - ${songData.song}</strong>
            <audio controls src="${previewUrl.audio}"></audio>
        `;

        resultsDiv.appendChild(resultElement);
    });
}

