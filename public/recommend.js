document.addEventListener('DOMContentLoaded', () => {
    const fetchRecommendations = async () => {
        try {
            // Get the email from the URL
            const params = new URLSearchParams(window.location.search);
            const email = params.get('email');
            console.log('User email:', email); // For debugging

            // Fetch user's search history from MongoDB
            const searchHistoryResponse = await fetch(`http://localhost:8000/get-search-history?email=${email}`);
            if (!searchHistoryResponse.ok) {
                throw new Error('Failed to fetch search history');
            }

            const searchHistory = await searchHistoryResponse.json();
            console.log('User search history:', searchHistory);

            if (searchHistory.length > 0) {
                // Use the most recent search (or any logic to choose which one to use)
                const recentSearch = searchHistory[0]; // Example: take the latest search
                const { brand, model, type, gender, size, color, material, price } = recentSearch;

                // Build the Elasticsearch query based on the search history
                const query = {
                    size: 10,  // Limit the results to 10
                    query: {
                        bool: {
                            should: []  // Array for multi-match conditions
                        }
                    }
                };

                // Add filters based on user's previous search history
                if (brand) {
                    query.query.bool.should.push({
                        match: {
                            "Brand": {
                                query: "Nike",
                                fuzziness: "AUTO"
                            }
                        }
                    });
                }
                if (model) {
                    query.query.bool.should.push({
                        match: {
                            "product_name": {
                                query: model,
                                fuzziness: "AUTO"
                            }
                        }
                    });
                }

                // Now send this query to Elasticsearch to fetch recommendations
                const response = await fetch('http://localhost:3000/search-nike-shoes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(query)
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch recommendations');
                }

                const data = await response.json();
                const products = data.hits.hits.map(hit => hit._source);

                // Create cards for each product
                const cardContainer = document.getElementById('shoePricesList');
                cardContainer.innerHTML = ''; // Clear any existing cards

                products.forEach((product, index) => {
                    // Create a card for the product
                    const card = document.createElement('div');
                    card.className = 'card';
                    const formattedPrice = `$${(product.sale_price / 100).toFixed(2)}`;
                    card.innerHTML = `
                        <h3><a href="https://www.google.com/search?q=${encodeURIComponent(product.product_name)}" target="_blank" style="color: white;">${product.product_name}</a></h3>
                        <p>Brand: ${product.brand}</p>
                        <p>Price: ${formattedPrice}</p>
                        <div class="image-container">
                            <button class="nav-button" id="prev-${index}">←</button>
                            <img id="image-${index}" src="${product.images[0]}" alt="${product.product_name}" class="product-image">
                            <button class="nav-button" id="next-${index}">→</button>
                        </div>
                    `;

                    cardContainer.appendChild(card);

                    // Set up image navigation
                    let currentImageIndex = 0;
                    document.getElementById(`prev-${index}`).addEventListener('click', () => {
                        currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
                        document.getElementById(`image-${index}`).src = product.images[currentImageIndex];
                    });

                    document.getElementById(`next-${index}`).addEventListener('click', () => {
                        currentImageIndex = (currentImageIndex + 1) % product.images.length;
                        document.getElementById(`image-${index}`).src = product.images[currentImageIndex];
                    });
                });
            } else {
                console.log('No search history found');

                // Fetch 10 records with rating = 5
                const fallbackQuery = {
                    size: 10,
                    query: {
                        match: {
                            rating: 5
                        }
                    }
                };

                const fallbackResponse = await fetch('http://localhost:3000/search-nike-shoes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fallbackQuery)
                });

                if (!fallbackResponse.ok) {
                    throw new Error('Failed to fetch fallback recommendations');
                }

                const fallbackData = await fallbackResponse.json();
                const fallbackProducts = fallbackData.hits.hits.map(hit => hit._source);

                // Create cards for fallback products
                const cardContainer = document.getElementById('shoePricesList');
                cardContainer.innerHTML = ''; // Clear any existing cards

                fallbackProducts.forEach((product, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    const formattedPrice = `$${(product.sale_price / 100).toFixed(2)}`;
                    card.innerHTML = `
                        <h3><a href="https://www.google.com/search?q=${encodeURIComponent(product.product_name)}" target="_blank" style="color: white;">${product.product_name}</a></h3>
                        <p>Brand: ${product.brand}</p>
                        <p>Price: ${formattedPrice}</p>
                        <div class="image-container">
                            <button class="nav-button" id="prev-${index}">←</button>
                            <img id="image-${index}" src="${product.images[0]}" alt="${product.product_name}" class="product-image">
                            <button class="nav-button" id="next-${index}">→</button>
                        </div>
                    `;

                    cardContainer.appendChild(card);

                    // Set up image navigation
                    let currentImageIndex = 0;
                    document.getElementById(`prev-${index}`).addEventListener('click', () => {
                        currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
                        document.getElementById(`image-${index}`).src = product.images[currentImageIndex];
                    });

                    document.getElementById(`next-${index}`).addEventListener('click', () => {
                        currentImageIndex = (currentImageIndex + 1) % product.images.length;
                        document.getElementById(`image-${index}`).src = product.images[currentImageIndex];
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    // Fetch recommendations on page load
    fetchRecommendations();
});
