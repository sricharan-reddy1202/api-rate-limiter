const express = require('express');
const rateLimiter = require('./middleware/rateLimiterMiddleware');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Rate Limiter Service Running 🚀');
});

// Apply middleware to route
app.get(
    '/test',
    rateLimiter({ capacity: 5, refillRate: 1 }),
    (req, res) => {
        res.json({ message: 'Request successful' });
    }
);

module.exports = app;