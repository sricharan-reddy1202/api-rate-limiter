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
    rateLimiter({ limit: 5, windowMs: 60 * 1000 }),
    (req, res) => {
        res.json({
            message: 'Request successful'
        });
    }
);

module.exports = app;