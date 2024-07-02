const { getMemoryCacheService } = require('./memory-cache'); // Assuming the file is named memory-cache-service.js
const { SECONDS, waitAsync } = require('./utils');

describe('MemoryCacheService', () => {
    let /** @type {MemoryCacheService<any>} */ service;
    let /** @type {import('crypto').UUID} */ uuid;
    let input;

    beforeEach(() => {
        service = getMemoryCacheService();
        uuid = '123e4567-e89b-12d3-a456-426614174000'; // Sample UUID
        input = { someData: 'This is test data' };
    });

    afterEach(() => {
        service.dispose(); // Cleanup after each test
    });

    it('should be able to get a cached value', async () => {
        await service.set(uuid, input);
        const cachedData = await service.get(uuid);
        expect(cachedData.payload).toEqual(input);
    });

    it('should return undefined for a non-existent key', async () => {
        const nonExistentKey = 'non-existent-key';
        const cachedData = await service.get(nonExistentKey);
        expect(cachedData).toBeUndefined();
    });

    it('should expire cached data after the specified lifespan', async () => {
        const shortLifespan = 100; // Milliseconds for faster test execution

        service.setCleanupInterval(shortLifespan);
        await service.set(uuid, input);
        const data = await service.get(uuid);

        await waitAsync(1 * SECONDS);
        const expiredData = await service.get(uuid);
        expect(expiredData).toBeUndefined();
    });

    it('should dispose of the cache service properly', async () => {
        await service.set(uuid, input);
        await service.dispose();
        const cachedData = await service.get(uuid);
        expect(cachedData).toBeUndefined();
    });
});
