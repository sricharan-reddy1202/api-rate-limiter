const { client } = require('../config/redis');

// ✅ Fixed Window (Redis version)
async function fixedWindowLimiter(key, limit, windowMs) {
    const redisKey = `rate:fixed:${key}`;

    let current = await client.get(redisKey);

    if (!current) {
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

// ✅ Sliding Window
async function slidingWindowLimiter(key, limit, windowMs) {
    const redisKey = `rate:sliding:${key}`;
    const currentTime = Date.now();

    await client.zRemRangeByScore(
        redisKey,
        0,
        currentTime - windowMs
    );

    const count = await client.zCard(redisKey);

    if (count < limit) {
        await client.zAdd(redisKey, {
            score: currentTime,
            value: currentTime.toString()
        });

        await client.expire(redisKey, Math.ceil(windowMs / 1000));

        return { allowed: true };
    }

    return { allowed: false };
}

module.exports = {
    fixedWindowLimiter,
    slidingWindowLimiter
};