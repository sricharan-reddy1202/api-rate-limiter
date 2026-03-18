const {
    fixedWindowLimiter,
    slidingWindowLimiter,
    tokenBucketLimiter
} = require('./rateLimiter');

function getLimiter(strategy) {
    switch (strategy) {
        case 'fixed-window':
            return fixedWindowLimiter;

        case 'sliding-window':
            return slidingWindowLimiter;

        case 'token-bucket':
            return tokenBucketLimiter;

        default:
            throw new Error('Invalid rate limiting strategy');
    }
}

module.exports = {
    getLimiter
};