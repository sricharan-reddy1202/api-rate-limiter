const express = require('express');
const { fixedWindowLimiter } = require('./services/rateLimiter');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Rate Limiter Service Running 🚀');
});

app.get('/test', (req, res) => {
    const key = req.ip; // user identification

    const result = fixedWindowLimiter(key, 5, 60 * 1000);

    if (!result.allowed) {
        return res.status(429).json({
            message: 'Too many requests, try again later'
        });
    }

    res.json({
        message: 'Request successful'
    });
});

module.exports = app;