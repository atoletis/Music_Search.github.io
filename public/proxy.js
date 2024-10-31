const express = require('express');
const request = require('request');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const apiKey = "UmlOUTRKSUJlWnMtR0JnYWhPMXg6WXB6elVyT3hUZENJQXJhSVJ3ZjNBQQ==";

app.use(cors());
app.use(express.json());

// Proxy endpoint
app.post('/api/search', (req, res) => {
    const options = {
        url: 'https://6c2ed68fed824a629b2aac6d178af637.us-central1.gcp.cloud.es.io/spotify_playlists/_search',
        method: 'POST',
        headers: {
            'Authorization': `ApiKey ${apiKey}`, // Use your API key from .env
            'Content-Type': 'application/json'
        },
        json: true,
        body: req.body // Forward the request body
    };

    request(options, (error, response, body) => {
        if (error) {
            return res.status(500).json({ error: 'Error communicating with Elasticsearch' });
        }
        res.json(body); // Return the response from Elasticsearch
    });
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
