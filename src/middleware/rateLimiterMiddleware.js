const { getLimiter } = require('../services/strategySelector');

function rateLimiter(options) {
    const { strategy } = options;

    const limiter = getLimiter(strategy);

    return async (req, res, next) => {
        const key = req.ip;

        let result;

        // Handle different strategies
        if (strategy === 'token-bucket') {
            const { capacity, refillRate } = options;
            result = await limiter(key, capacity, refillRate);
        } else {
            const { limit, windowMs } = options;
            result = await limiter(key, limit, windowMs);
        }

        if (!result.allowed) {
            return res.status(429).json({
                message: 'Too many requests, please try again later'
            });
        }

        next();
    };
}

module.exports = rateLimiter;