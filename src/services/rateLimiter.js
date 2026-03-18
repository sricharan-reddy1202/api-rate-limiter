const store = {}; // In-memory store (later we replace with Redis)

function fixedWindowLimiter(key, limit, windowMs) {
    const currentTime = Date.now();

    if (!store[key]) {
        store[key] = {
            count: 1,
            startTime: currentTime
        };
        return { allowed: true };
    }

    const elapsedTime = currentTime - store[key].startTime;

    // If window expired → reset
    if (elapsedTime > windowMs) {
        store[key] = {
            count: 1,
            startTime: currentTime
        };
        return { allowed: true };
    }

    // Within window
    if (store[key].count < limit) {
        store[key].count++;
        return { allowed: true };
    }

    return { allowed: false };
}

module.exports = {
    fixedWindowLimiter
};