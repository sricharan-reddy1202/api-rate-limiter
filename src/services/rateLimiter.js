const { client } = require('../config/redis');


//FIXED WINDOW 
async function fixedWindowLimiter(key, limit, windowMs) {
    const redisKey = `rate:fixed:${key}`;

    let current = await client.get(redisKey);

    // First request
    if (!current) {
        await client.set(redisKey, 1, { PX: windowMs });

        return {
            allowed: true,
            remaining: limit - 1,
            retryAfter: 0
        };
    }

    current = parseInt(current);

    // Within limit
    if (current < limit) {
        await client.incr(redisKey);

        return {
            allowed: true,
            remaining: limit - (current + 1),
            retryAfter: 0
        };
    }

    // Limit exceeded
    const ttl = await client.pTTL(redisKey);

    return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(0, Math.ceil(ttl / 1000))
    };
}


//SLIDING WINDOW 
async function slidingWindowLimiter(key, limit, windowMs) {
    const redisKey = `rate:sliding:${key}`;
    const currentTime = Date.now();

    // Remove old requests
    await client.zRemRangeByScore(redisKey, 0, currentTime - windowMs);

    // Count current requests
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

    // Get oldest request timestamp
    const oldest = await client.zRange(redisKey, 0, 0, {
        WITHSCORES: true
    });

    const oldestTimestamp = parseInt(oldest[0].score);

    const retryAfter = Math.max(
        0,
        Math.ceil((oldestTimestamp + windowMs - currentTime) / 1000)
    );

    return {
        allowed: false,
        remaining: 0,
        retryAfter
    };
}


// TOKEN BUCKET
async function tokenBucketLimiter(key, capacity, refillRate) {
    const redisKey = `rate:token:${key}`;
    const currentTime = Date.now();

    let data = await client.hGetAll(redisKey);

    let tokens;
    let lastRefillTime;

    // First request
    if (Object.keys(data).length === 0) {
        tokens = capacity - 1;
        lastRefillTime = currentTime;

        await client.hSet(redisKey, {
            tokens,
            lastRefillTime
        });

        // Set TTL (avoid memory leak)
        await client.expire(redisKey, Math.ceil(capacity / refillRate));

        return {
            allowed: true,
            remaining: capacity - 1,
            retryAfter: 0
        };
    }

    tokens = parseFloat(data.tokens);
    lastRefillTime = parseInt(data.lastRefillTime);

    // Refill tokens
    const timePassed = (currentTime - lastRefillTime) / 1000;
    const refillTokens = timePassed * refillRate;

    tokens = Math.min(capacity, tokens + refillTokens);

    // If request allowed
    if (tokens >= 1) {
        tokens -= 1;

        await client.hSet(redisKey, {
            tokens,
            lastRefillTime: currentTime
        });

        await client.expire(redisKey, Math.ceil(capacity / refillRate));

        return {
            allowed: true,
            remaining: Math.floor(tokens),
            retryAfter: 0
        };
    }

    // If blocked
    await client.hSet(redisKey, {
        tokens,
        lastRefillTime
    });

    await client.expire(redisKey, Math.ceil(capacity / refillRate));

    const retryAfter = Math.max(
        0,
        Math.ceil((1 - tokens) / refillRate)
    );

    return {
        allowed: false,
        remaining: 0,
        retryAfter
    };
}



module.exports = {
    fixedWindowLimiter,
    slidingWindowLimiter,
    tokenBucketLimiter
};