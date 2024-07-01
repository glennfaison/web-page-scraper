/**
 * @type {import("../typedef")}
 */
const { SECONDS } = require('./utils');

/**
 * Returns a MemoryCacheService object
 * @param {number} [storageLifeSpanMS]
 * @returns {MemoryCacheService<T>}
 */
const getMemoryCacheService = (storageLifeSpanMS = SECONDS * 60 * 60 * 0.5) => {
    let memoryCache = {};
    let interval;

    // Cleanup function to remove expired data from the storage
    const cleanupMemoryCache = () => {
        const now = Date.now();
        for (const key in memoryCache) {
            if (memoryCache[key].expiresAt <= now) {
                delete memoryCache[key];
            }
        }
    };

    /**
     * Set the cleanup interval
     * @param {number} milliseconds The interval after which the cleanup function should run
     */
    const setCleanupInterval = (milliseconds) => {
        clearInterval(interval);
        storageLifeSpanMS = milliseconds;
        // Periodically run the cleanup function
        interval = setInterval(() => cleanupMemoryCache(), storageLifeSpanMS);
    };

    setCleanupInterval(storageLifeSpanMS);

    /** @type {MemoryCacheService} */
    return {
        get: async (uuid) => {
            return memoryCache[JSON.stringify(uuid)];
        },
        set: async (uuid, payload) => {
            memoryCache[JSON.stringify(uuid)] = { payload, createdAt: Date.now(), expiresAt: Date.now() + storageLifeSpanMS };
        },
        dispose: async () => {
            clearInterval(interval);
            memoryCache = {};
        },
        setCleanupInterval,
    };
};

module.exports = { getMemoryCacheService };