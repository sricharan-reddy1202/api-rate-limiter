// const { fixedWindowLimiter } = require('../services/rateLimiter');

// function rateLimiter(options) {
//     const { limit, windowMs } = options;

//     return async (req, res, next) => {
//         const key = req.ip;

//         const result = await fixedWindowLimiter(key, limit, windowMs);

//         if (!result.allowed) {
//             return res.status(429).json({
//                 message: 'Too many requests, please try again later'
//             });
//         }

//         next();
//     };
// }

// module.exports = rateLimiter;
// const { slidingWindowLimiter } = require('../services/rateLimiter');

// function rateLimiter(options) {
//     const { limit, windowMs } = options;

//     return async (req, res, next) => {
//         const key = req.ip;

//         const result = await slidingWindowLimiter(key, limit, windowMs);

//         if (!result.allowed) {
//             return res.status(429).json({
//                 message: 'Too many requests, please try again later'
//             });
//         }

//         next();
//     };
// }

// module.exports = rateLimiter;
const { tokenBucketLimiter } = require('../services/rateLimiter');

function rateLimiter(options) {
    const { capacity, refillRate } = options;

    return async (req, res, next) => {
        const key = req.ip;

        const result = await tokenBucketLimiter(
            key,
            capacity,
            refillRate
        );

        if (!result.allowed) {
            return res.status(429).json({
                message: 'Too many requests, please try again later'
            });
        }

        next();
    };
}

module.exports = rateLimiter;