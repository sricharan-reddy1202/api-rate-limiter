const express = require('express');
const rateLimiter = require('./middleware/rateLimiterMiddleware');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Rate Limiter Service Running 🚀');
});

// Apply middleware to route
// Sliding Window Example
app.get(
    '/sliding',
    rateLimiter({
        strategy: 'sliding-window',
        limit: 5,
        windowMs: 60 * 1000
    }),
    (req, res) => {
        res.json({ message: 'Sliding window success' });
    }
);

// Token Bucket Example
app.get(
    '/token',
    rateLimiter({
        strategy: 'token-bucket',
        capacity: 5,
        refillRate: 1
    }),
    (req, res) => {
        res.json({ message: 'Token bucket success' });
    }
);

// Fixed Window Example
app.get(
    '/fixed',
    rateLimiter({
        strategy: 'fixed-window',
        limit: 5,
        windowMs: 60 * 1000
    }),
    (req, res) => {
        res.json({ message: 'Fixed window success' });
    }
);
module.exports = app;