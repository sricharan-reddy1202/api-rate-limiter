const { fixedWindowLimiter } = require('../services/rateLimiter');

function rateLimiter(options) {
    const { limit, windowMs } = options;

    // This is the actual middleware function
    return (req, res, next) => {
        const key = req.ip;

        const result = fixedWindowLimiter(key, limit, windowMs);

        if (!result.allowed) {
            return res.status(429).json({
                message: 'Too many requests, please try again later'
            });
        }

        next(); // move to next middleware/route
    };
}

module.exports = rateLimiter;