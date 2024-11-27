document.getElementById('shoeSearchForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent default form submission

    // Call the fetchShoePrices function when the form is submitted
    await fetchShoePrices();
});

let brand1, model1, type1, gender1, size1, color1, material1, price1;

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

    try {
        const response = await fetch('http://localhost:8000/check-spelling', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand, model, type, gender, size, color, material, price })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Corrected Fields:', data.correctedFields);

            // Update each variable and input field
            brand1 = data.correctedFields.brand;
            console.log(brand1);
            model1 = data.correctedFields.model;
            type1 = data.correctedFields.type;
            gender1 = data.correctedFields.gender;
            console.log(gender1);
            size1 = data.correctedFields.size;
            color1 = data.correctedFields.color;
            material1 = data.correctedFields.material;
            price1 = data.correctedFields.price;

        } else {
            console.error('Failed to check spelling');
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }

    // Get the email from the URL (passed from login.js)
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    console.log('User email:', email); // For debugging

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
    if (brand1) {
        query.query.bool.must.push({
            match: {
                "Brand": {
                    query: brand1,
                    fuzziness: "AUTO",  // Handle variations like "adid" or "adida"
                    prefix_length: 1    // Ensure the first character matches
                }
            }
        });
    }
    if (model1) query.query.bool.must.push({ match: { "Model": model1 } });
    if (type1) query.query.bool.must.push({ match: { "Type": type1 } });
    if (gender1) query.query.bool.must.push({ match: { "Gender": gender1 } });
    if (size1) query.query.bool.must.push({ match: { "Size": size1 } });
    if (color1) query.query.bool.must.push({ match: { "Color": color1 } });
    if (material1) query.query.bool.must.push({ match: { "Material": material1 } });

    // Handle price filter: remove "$" and convert to integer, then add price filter to the query
    if (price) {
        // Remove dollar sign and trim whitespace, then convert to float
        const numericPrice = parseFloat(price.replace('$', '').trim()) + 1;

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
        // Make a POST request to search for shoes
        const response = await fetch('http://localhost:3000/search-shoes', {  // Proxy request
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        });

        const data = await response.json();
        const hits = data.hits.hits;

        // Create cards for each shoe
        const shoeListContainer = document.getElementById('shoePricesList');
        shoeListContainer.innerHTML = '';  // Clear previous results

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

        // Save the search data to the database (MongoDB)
        const saveResponse = await fetch('http://localhost:8000/save-shoe-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                brand: brand,
                model: model,
                type: type,
                gender: gender,
                size: size,
                color: color,
                material: material,
                price: price,
                date: new Date()  // Optional: include the search date
            })
        });

        if (saveResponse.ok) {
            console.log('Search data saved to database');
        } else {
            console.error('Error saving search data to database');
        }

    } catch (error) {
        console.error('Error fetching shoe prices:', error);
    }
}
