function clearErrors() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
    const errorMessagesContainer = document.getElementById('error-messages');
    errorMessagesContainer.innerHTML = '';
    errorMessagesContainer.style.display = 'none';
}

function displayErrors(errors) {
    const errorMessagesContainer = document.getElementById('error-messages');
    errorMessagesContainer.innerHTML = errors.join('<br>');
    errorMessagesContainer.style.display = 'block';
}

async function handleSignup(event) {
    event.preventDefault(); // Prevent the form from submitting immediately
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Clear previous errors
    clearErrors(); // This function should now be accessible

    let errors = []; // Collect errors

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errors.push('* Please enter a valid email.');
    }

    // Validate password
    const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
        errors.push('* Password must be at least 8 characters long, contain at least one number and one special character.');
    }

    if (errors.length > 0) {
        displayErrors(errors);
    } else {
        // Send the signup data to the backend
        const response = await fetch("http://localhost:8000/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            window.location.href = "login.html"; // Redirect to login
        } else {
            alert(data.message || 'Signup failed. Please try again.');
        }
    }
}
