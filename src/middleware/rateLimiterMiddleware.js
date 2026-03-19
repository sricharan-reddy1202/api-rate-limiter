const { getLimiter } = require('../services/strategySelector');

function rateLimiter(options) {
    const { strategy } = options;
    const limiter = getLimiter(strategy);

    return async (req, res, next) => {
        const key = req.ip;

        let result;

        if (strategy === 'token-bucket') {
            const { capacity, refillRate } = options;
            result = await limiter(key, capacity, refillRate);

            res.set('X-RateLimit-Limit', capacity);
            res.set('X-RateLimit-Remaining', Math.floor(result.tokens || 0));
        } else {
            const { limit, windowMs } = options;
            result = await limiter(key, limit, windowMs);

            res.set('X-RateLimit-Limit', limit);
            res.set('X-RateLimit-Remaining', result.remaining);
        }

        if (!result.allowed) {
            res.set('Retry-After', result.retryAfter || 1);

            console.log(`Rate limit exceeded for ${key}`);

            return res.status(429).json({
                message: 'Too many requests, please try again later'
            });
        }

        next();
    };
}

module.exports = rateLimiter;