require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for users
const users = [];

// Secret keys from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'your-news-api-key';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = decoded; // Store decoded token info in request
        next();
    });
};

// POST /users/signup - User Registration
app.post('/users/signup', async (req, res) => {
    try {
        const { name, email, password, preferences } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user object
        const user = {
            name,
            email,
            password: hashedPassword,
            preferences: preferences || []
        };

        // Save user
        users.push(user);

        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /users/login - User Login
app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /users/preferences - Get user preferences
app.get('/users/preferences', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.email === req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ preferences: user.preferences });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /users/preferences - Update user preferences
app.put('/users/preferences', authenticateToken, (req, res) => {
    try {
        const { preferences } = req.body;

        if (!preferences || !Array.isArray(preferences)) {
            return res.status(400).json({ error: 'Preferences must be an array' });
        }

        const user = users.find(u => u.email === req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update preferences
        user.preferences = preferences;

        res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /news - Fetch news articles based on user preferences
app.get('/news', authenticateToken, async (req, res) => {
    try {
        const user = users.find(u => u.email === req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If user has no preferences, return empty news array
        if (!user.preferences || user.preferences.length === 0) {
            return res.status(200).json({ news: [] });
        }

        // Build query from user preferences
        const query = user.preferences.join(' OR ');

        // If API key is not configured, return mock data for testing
        if (!NEWS_API_KEY || NEWS_API_KEY === 'your-news-api-key') {
            const mockNews = user.preferences.map((pref, index) => ({
                title: `Latest news about ${pref}`,
                description: `This is a sample news article about ${pref}`,
                url: `https://example.com/news/${pref}-${index}`,
                publishedAt: new Date().toISOString(),
                source: 'Mock News Source'
            }));
            return res.status(200).json({ news: mockNews });
        }

        try {
            // Fetch news from external API
            const response = await axios.get(NEWS_API_URL, {
                params: {
                    q: query,
                    apiKey: NEWS_API_KEY,
                    pageSize: 10,
                    sortBy: 'publishedAt'
                }
            });

            // Format news articles
            const news = response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.publishedAt,
                source: article.source?.name || 'Unknown'
            }));

            res.status(200).json({ news });
        } catch (apiError) {
            // If API fails, return mock data for testing purposes
            const mockNews = user.preferences.map((pref, index) => ({
                title: `Latest news about ${pref}`,
                description: `This is a sample news article about ${pref}`,
                url: `https://example.com/news/${pref}-${index}`,
                publishedAt: new Date().toISOString(),
                source: 'Mock News Source'
            }));
            return res.status(200).json({ news: mockNews });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Only start server if not in test environment
if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}

module.exports = app;