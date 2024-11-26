document.addEventListener('DOMContentLoaded', () => {
    const fetchRecommendations = async () => {
        try {
            // Query to fetch top 10 rows with rating 5
            const query = {
                size: 10,
                query: {
                    match: { rating: 5 }
                }
            };

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
            const products = data.hits.hits.map(hit => hit._source); // Extract product data

            // Create cards for each product
            const cardContainer = document.getElementById('shoePricesList');
            cardContainer.innerHTML = ''; // Clear any existing cards

            products.forEach((product, index) => {
                // Create a card for the product
                const card = document.createElement('div');
                card.className = 'card';
                const formattedPrice = `$${(product.sale_price / 100).toFixed(2)}`;
                // Add product details
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
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    // Fetch recommendations on page load
    fetchRecommendations();
});
