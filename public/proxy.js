const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000; // Choose an available port

// Enable CORS for the proxy server
app.use(cors());

// Use bodyParser middleware to handle JSON requests
app.use(express.json());

const elasticsearchUrl = 'https://5e2a9ceda2124ef780b28484f61ef5f8.us-central1.gcp.cloud.es.io';
const apiKey = 'UUxQRmFaTUItSVFGQXB2U3QtbmQ6ejhOYUl2NG1SdzZDSUU1T3hkTXR5QQ=='; // Replace with your actual API key

// Proxy POST request for 'shoe_prices' index
app.post('/search-shoes', async (req, res) => {
  try {
    console.log('Entered /search-shoes');
    const response = await axios.post(
      `${elasticsearchUrl}/shoe_prices/_search`,
      req.body, // Pass the body from the client request to Elasticsearch
      {
        headers: {
          Authorization: `ApiKey ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );
    res.json(response.data); // Return the Elasticsearch response to the client
  } catch (error) {
    console.error('Error fetching data from Elasticsearch for shoe_prices:', error);
    res.status(500).json({ error: 'Error fetching data from Elasticsearch for shoe_prices' });
  }
});

// Proxy POST request for 'nike_shoes_sales' index
app.post('/search-nike-shoes', async (req, res) => {
  try {
    console.log('Entered /search-nike-shoes');
    const response = await axios.post(
      `${elasticsearchUrl}/nike_shoes_sales/_search`,
      req.body, // Pass the body from the client request to Elasticsearch
      {
        headers: {
          Authorization: `ApiKey ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );
    res.json(response.data); // Return the Elasticsearch response to the client
  } catch (error) {
    console.error('Error fetching data from Elasticsearch for nike_shoes_sales:', error);
    res.status(500).json({ error: 'Error fetching data from Elasticsearch for nike_shoes_sales' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
