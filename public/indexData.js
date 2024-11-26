const fs = require('fs');
const fetch = require('node-fetch');

// Elasticsearch endpoint and credentials
const elasticsearchUrl = 'https://5e2a9ceda2124ef780b28484f61ef5f8.us-central1.gcp.cloud.es.io';
const elasticsearchApiKey = 'ApiKey UUxQRmFaTUItSVFGQXB2U3QtbmQ6ejhOYUl2NG1SdzZDSUU1T3hkTXR5QQ==';

// Helper to delete an index
const deleteIndex = async (index) => {
    try {
        const response = await fetch(`${elasticsearchUrl}/${index}`, {
            method: 'DELETE',
            headers: {
                'Authorization': elasticsearchApiKey
            }
        });

        if (response.ok) {
            console.log(`Index "${index}" deleted successfully.`);
        } else if (response.status === 404) {
            console.log(`Index "${index}" does not exist.`);
        } else {
            const errorText = await response.text();
            throw new Error(`Failed to delete index "${index}": ${errorText}`);
        }
    } catch (error) {
        console.error('Error deleting index:', error);
    }
};

// Helper to insert a single document
const insertDocument = async (item, indexName) => {
    try {
        const response = await fetch(`${elasticsearchUrl}/${indexName}/_doc`, {
            method: 'POST',
            headers: {
                'Authorization': elasticsearchApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Insert failed for "${indexName}": ${errorText}`);
        }

        const result = await response.json();
        console.log(`Document inserted into "${indexName}":`, result);
    } catch (error) {
        console.error('Error inserting document:', error);
    }
};

// Main function to delete indices and insert new data
const indexData = async () => {
    const indices = [
        { filePath: 'nike_shoes_sales.json', indexName: 'nike_shoes_sales' },
        { filePath: 'Shoe prices.json', indexName: 'shoe_prices' }
    ];

    for (const { filePath, indexName } of indices) {
        console.log(`Processing index: "${indexName}"`);

        // Read the JSON file
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error(`Error reading file "${filePath}":`, err);
                return;
            }

            try {
                const items = JSON.parse(data);

                // Process and insert each item
                for (const item of items) {
                    if (indexName === 'shoe_prices' && item["Price (USD)"]) {
                        // Convert Price (USD) to float for Shoe prices
                        item["Price (USD)"] = parseFloat(item["Price (USD)"]);
                    }

                    await insertDocument(item, indexName);
                }
            } catch (parseErr) {
                console.error(`JSON parsing error for "${filePath}":`, parseErr);
            }
        });
    }
};

// Execute the function
indexData();
