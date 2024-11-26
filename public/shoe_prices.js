document.getElementById('shoeSearchForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent default form submission

    // Call the fetchShoePrices function when the form is submitted
    await fetchShoePrices();
});

async function fetchShoePrices() {
    // Get form input values
    const brand = document.getElementById('brand').value.trim();
    const model = document.getElementById('model').value.trim();
    const type = document.getElementById('type').value.trim();
    const gender = document.getElementById('gender').value.trim();
    const size = document.getElementById('size').value.trim();
    const color = document.getElementById('color').value.trim();
    const material = document.getElementById('material').value.trim();
    const price = document.getElementById('price').value.trim();

    // Build the query dynamically based on input values
    const query = {
        query: {
            bool: {
                must: []  // Array to hold the filter conditions
            }
        },
        size: 10  // Limit the results to 10
    };

    // Add filters to the query based on input fields
    //if (brand) query.query.bool.must.push({ match: { "Brand": brand } });
    if (brand) {
        query.query.bool.must.push({
            match: {
                "Brand": {
                    query: brand,
                    fuzziness: "AUTO",  // Handle variations like "adid" or "adida"
                    prefix_length: 1    // Ensure the first character matches
                }
            }
        });
    }    
    if (model) query.query.bool.must.push({ match: { "Model": model } });
    if (type) query.query.bool.must.push({ match: { "Type": type } });
    if (gender) query.query.bool.must.push({ match: { "Gender": gender } });
    if (size) query.query.bool.must.push({ match: { "Size": size } });
    if (color) query.query.bool.must.push({ match: { "Color": color } });
    if (material) query.query.bool.must.push({ match: { "Material": material } });

    // Handle price filter: remove "$" and convert to integer, then add price filter to the query
    if (price) {
        // Remove dollar sign and trim whitespace, then convert to float
        const numericPrice = parseFloat(price.replace('$', '').trim());

        // Check if the value is a valid number before adding it to the query
        if (!isNaN(numericPrice)) {
            query.query.bool.must.push({
                range: {
                    "Price (USD)": {
                        lt: numericPrice  // Filter shoes with price less than the entered price
                    }
                }
            });
        } else {
            console.error("Invalid price format entered:", price);
        }
    }

    try {
        const response = await fetch('http://localhost:3000/search-shoes', {  // Proxy request
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        });

        const data = await response.json();
        const hits = data.hits.hits;

        const shoeListContainer = document.getElementById('shoePricesList');
        shoeListContainer.innerHTML = '';  // Clear previous results

        // Create cards for each shoe
        hits.forEach(hit => {
            const shoe = hit._source;
            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <h3><a href="https://www.google.com/search?q=${encodeURIComponent(shoe['Brand'] + ' ' + shoe['Model'])}" target="_blank" style="color: white;">${shoe['Brand']} ${shoe["Model"]}</a></h3>
                <p><strong>Type:</strong> ${shoe["Type"]}</p>
                <p><strong>Gender:</strong> ${shoe["Gender"]}</p>
                <p><strong>Size:</strong> ${shoe["Size"]}</p>
                <p><strong>Color:</strong> ${shoe["Color"]}</p>
                <p><strong>Material:</strong> ${shoe["Material"]}</p>
                <p><strong>Price:</strong> $${shoe['Price (USD)']}</p>
            `;

            shoeListContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching shoe prices:', error);
    }
}
