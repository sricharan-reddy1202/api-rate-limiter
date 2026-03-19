const { client } = require('../config/redis');

//  Fixed Window (Redis version)
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
//sliding window Limiter
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

        return {
            allowed: true,
            remaining: limit - (count + 1),
            retryAfter: 0
        };
    }

    // Calculate retry time
    const oldest = await client.zRange(redisKey, 0, 0, { WITHSCORES: true });
    const retryAfter = Math.ceil((oldest[1] + windowMs - currentTime) / 1000);

    return {
        allowed: false,
        remaining: 0,
        retryAfter
    };
}
// Token Bucket Limiter
async function tokenBucketLimiter(key, capacity, refillRate) {
    const redisKey = `rate:token:${key}`;
    const currentTime = Date.now();

    let data = await client.hGetAll(redisKey);

    let tokens;
    let lastRefillTime;

    if (Object.keys(data).length === 0) {
        // First request
        tokens = capacity - 1;
        lastRefillTime = currentTime;

        await client.hSet(redisKey, {
            tokens,
            lastRefillTime
        });

        return { allowed: true };
    }

    tokens = parseFloat(data.tokens);
    lastRefillTime = parseInt(data.lastRefillTime);

    // Calculate tokens to add
    const timePassed = (currentTime - lastRefillTime) / 1000;
    const refillTokens = timePassed * refillRate;

    tokens = Math.min(capacity, tokens + refillTokens);

    if (tokens >= 1) {
        tokens -= 1;

        await client.hSet(redisKey, {
            tokens,
            lastRefillTime: currentTime
        });

        return { allowed: true };
    }

    await client.hSet(redisKey, {
        tokens,
        lastRefillTime
    });

    return { allowed: false };
}
module.exports = {
    fixedWindowLimiter,
    slidingWindowLimiter,
    tokenBucketLimiter
};