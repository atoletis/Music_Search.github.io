const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect("mongodb+srv://aditya:aditya@aditya.bss2n.mongodb.net/myDatabase?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Google OAuth2 Client
const client = new OAuth2Client("133157861464-6qmpqtp6rjmackenv77sqi4sc99nsonf.apps.googleusercontent.com");

// User schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    googleId: String,
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Route to handle Signup
app.post('/api/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route to handle Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        res.status(200).json({ message: 'Login successful.', user: { email: user.email } });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route to handle Google Sign-In
app.post('/api/auth/google', async (req, res) => {
    const { id_token, email, name } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];

        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({
                email: email,
                name: name,
                googleId: googleId,
            });
            await user.save();
        }

        res.status(200).json({
            message: 'User authenticated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('Error verifying Google token:', error);
        res.status(401).send('Unauthorized');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
