const fs = require('fs');
const fetch = require('node-fetch');

const indexData = async () => {
    fs.readFile('spotify_dataset.json', 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        try {
            const songs = JSON.parse(data);
            const bulkData = songs.map(song => {
                return JSON.stringify({ index: { _index: 'spotify_playlists' } }) + '\n' +
                       JSON.stringify(song);
            }).join('\n') + '\n'; // Join all parts with new lines

            const response = await fetch('https://6c2ed68fed824a629b2aac6d178af637.us-central1.gcp.cloud.es.io:443/_bulk', {
                method: 'POST',
                headers: {
                    'Authorization': 'ApiKey UmlOUTRKSUJlWnMtR0JnYWhPMXg6WXB6elVyT3hUZENJQXJhSVJ3ZjNBQQ==',
                    'Content-Type': 'application/json'
                },
                body: bulkData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Bulk indexing result:', result);
        } catch (parseErr) {
            console.error('JSON parsing error:', parseErr);
        }
    });
};

indexData();
