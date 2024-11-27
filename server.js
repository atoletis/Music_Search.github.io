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

// Shoe search schema for search history
const shoeSearchSchema = new mongoose.Schema({
    email: { type: String, required: true },
    brand: String,
    model: String,
    type: String,
    gender: String,
    size: String,
    color: String,
    material: String,
    price: String,
    date: { type: Date, default: Date.now },
});

const ShoeSearch = mongoose.model('ShoeSearch', shoeSearchSchema);

const correctionIntent = {
    fields: ["brand", "model", "type", "gender", "size", "color", "material", "price"],
    corrections: {
        "Nike": ["Nikee", "Nikey", "Nikes", "nIkEe", "Nicke"],
        "Adidas": ["Adiddas", "Adidaas", "Adids", "Addidas", "Adidass", "adidAs"],
        "Reebok": ["Rebok", "Rebock", "Reboc", "Reeebok", "Rebokks"],
        "Converse": ["Convers", "Converce", "Converz", "Conversee"],
        "Puma": ["Pumma", "Pumaa", "Puuma", "Pumah"],
        "Vans": ["Vanz", "Vanns", "Van's", "Vannz"],
        "Black": ["Blak", "Blac", "Blk", "Bllack"],
        "White": ["Wite", "Whit", "Whyte", "Whitt"],
        "Grey": ["Gray", "Greay", "Graye", "Gr"],
        "Leather": ["Leathr", "Lethar", "Lthr", "Lehter"],
        "Mesh": ["Msh", "Meesh", "Meshh", "Meehsh"],
        "Running": ["Runing", "Ruuning", "Runnin", "Runin"],
        "Casual": ["Casul", "Casule", "Cazual", "Causal"],
        "Women": ["Womenn", "Weman", "Woman", "Wooman"],
        "Men": ["Menn", "Man", "Meen", "Mann"]
    }
};

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

// Route to handle saving shoe search history
app.post('/save-shoe-search', async (req, res) => {
    const { email, brand, model, type, gender, size, color, material, price, date } = req.body;

    try {
        const newSearch = new ShoeSearch({
            email,
            brand,
            model,
            type,
            gender,
            size,
            color,
            material,
            price,
            date,  // Ensure the date is passed from the frontend or generated server-side
        });

        await newSearch.save();
        res.status(201).json({ message: 'Search data saved successfully.' });
    } catch (error) {
        console.error('Error saving search data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.get('/get-search-history', async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).send({ message: 'Email is required' });
    }

    try {
        const searchHistory = await ShoeSearch.find({ email })
            .sort({ date: -1 }) // Sort by date (latest first)
            .exec();

        // Return search history as JSON
        res.status(200).json(searchHistory);
    } catch (error) {
        console.error('Error fetching search history:', error);
        res.status(500).send({ message: 'Error fetching search history' });
    }
});

app.post('/check-spelling', (req, res) => {
    const { brand, model, type, gender, size, color, material, price } = req.body;
    console.log("ENters");

    const correctWord = (input, field) => {
        const corrections = correctionIntent.corrections;
        const normalizedInput = input.toLowerCase();
        for (const correct in corrections) {
            const normalizedCorrect = correct.toLowerCase();
            const normalizedVariants = corrections[correct].map(variant => variant.toLowerCase());

            if (normalizedInput === normalizedCorrect || normalizedVariants.includes(normalizedInput)) {
                return correct; // Return the correctly capitalized version
            }
        }
        return input; // Return the original input if no match is found
    };

    const correctedFields = {
        brand: correctWord(brand, 'brand'),
        model: model, // Assuming no corrections defined for "model"
        type: correctWord(type, 'type'),
        gender: correctWord(gender, 'gender'),
        size: size, // Assuming no corrections defined for "size"
        color: correctWord(color, 'color'),
        material: correctWord(material, 'material'),
        price: price // Price is not corrected as requested
    };
    console.log(correctedFields);
    res.json({
        message: "Spell check completed",
        correctedFields
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
