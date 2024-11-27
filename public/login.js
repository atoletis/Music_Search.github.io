async function handleLogin(event) {
    event.preventDefault(); // Prevent the form from submitting immediately
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Clear previous errors
    clearErrors();

    let errors = []; // Collect errors

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errors.push('* Please enter a valid email.');
    }

    // Validate password
    if (password.length < 8) {
        errors.push('* Password must be at least 8 characters long.');
    }

    if (errors.length > 0) {
        displayErrors(errors);
    } else {
        try {
            // Send the login data to the backend
            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to the desired page after login
                const encodedEmail = encodeURIComponent(email); // Encode email for safe URL usage
                window.location.href = `main.html?email=${encodedEmail}`;
            } else {
                displayErrors([data.message || 'Login failed. Please try again.']);
            }
        } catch (error) {
            console.error('Error during login:', error);
            displayErrors(['An error occurred. Please try again later.']);
        }
    }
}

function displayErrors(errors) {
    const errorMessagesContainer = document.getElementById('error-messages');
    errorMessagesContainer.innerHTML = errors.join('<br>'); // Join errors with line breaks
    errorMessagesContainer.style.display = 'block'; // Show the error messages
}

function clearErrors() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
    const errorMessagesContainer = document.getElementById('error-messages');
    errorMessagesContainer.innerHTML = ''; // Clear previous error messages
    errorMessagesContainer.style.display = 'none'; // Hide the error messages
}
