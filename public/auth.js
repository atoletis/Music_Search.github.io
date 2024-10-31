// Initialize Google Sign-In client
window.onload = function() {
    google.accounts.id.initialize({
        client_id: "133157861464-6qmpqtp6rjmackenv77sqi4sc99nsonf.apps.googleusercontent.com", // Replace with your Client ID
        callback: handleCredentialResponse
    });
};

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const userObject = jwt_decode(response.credential); // Use jwt-decode to parse the JWT
    console.log("Google User Object:", userObject);
    
    // Send user information to the backend for verification
    fetch('/api/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id_token: response.credential, // Send the ID token received from Google
            email: userObject.email,        // Optionally include other user data
            name: userObject.name
        }),
    })
    .then(response => {
        if (response.ok) {
            // Redirect or perform actions after successful login
            window.location.href = "/dashboard"; // Change this to your desired redirect URL
        } else {
            console.error('Login failed:', response.statusText);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Google login function triggered by the button
function googleLogin() {
    google.accounts.id.prompt(); // This prompts the user to login
}
