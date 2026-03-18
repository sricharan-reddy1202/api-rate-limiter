const { client } = require('../config/redis');

async function fixedWindowLimiter(key, limit, windowMs) {
    const redisKey = `rate:${key}`;

    // Get current count
    let current = await client.get(redisKey);

    if (!current) {
        // First request
        await client.set(redisKey, 1, {
            PX: windowMs
        });
        return { allowed: true };
    }

    current = parseInt(current);

    if (current < limit) {
        await client.incr(redisKey);
        return { allowed: true };
    }

    return { allowed: false };
}

module.exports = {
    fixedWindowLimiter
};