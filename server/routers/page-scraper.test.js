const request = require('supertest');
const express = require('express');

const { getMemoryCacheService } = require('../services/memory-cache');
const { getPageScraperService } = require('../services/page-scraper');
const { getPageScraperRouter } = require('./page-scraper');
const { SECONDS } = require('../services/utils');
const { getHtmlRetrieverService } = require('../services/html-retriever');

const memoryCacheService = getMemoryCacheService();
const htmlRetrieverService = getHtmlRetrieverService();
const pageScraperService = getPageScraperService();

describe('PageScraperRouter', () => {
    let /** @type {import('express')}*/ app;
    let /** @type {PageScraperRouter} */ router;

    beforeAll(async () => {
        app = express();
        router = getPageScraperRouter(htmlRetrieverService, memoryCacheService, pageScraperService);
        router.registerRoutes(app);
    });

    afterAll(async () => {
        await htmlRetrieverService.dispose();
    });

    describe('GET /api/v1/analyze', () => {
        it('should return a status code of 400 if no URL is provided', async () => {
            await process.nextTick(() => { }); // {@see https://stackoverflow.com/questions/69976411/jest-tlswrap-open-handle-error-using-simple-node-postgres-pool-query-fixed-wit}
            const response = await await request(app).get('/api/v1/analyze');
            expect(response.statusCode).toBe(400);
        });

        it('should return a status code of 200 if given a working URL', async () => {
            await process.nextTick(() => { }); // {@see https://stackoverflow.com/questions/69976411/jest-tlswrap-open-handle-error-using-simple-node-postgres-pool-query-fixed-wit}
            const response = await request(app).get('/api/v1/analyze?url=https://linkedin.com/login');
            expect(response.statusCode).toBe(200);
        });

        it('should not store the advanced link data in the cache when performDeepAnalysis is false', async () => {
            const url = 'https://linkedin.com/login';
            await process.nextTick(() => { }); // {@see https://stackoverflow.com/questions/69976411/jest-tlswrap-open-handle-error-using-simple-node-postgres-pool-query-fixed-wit}
            const response = await await request(app).get(`/api/v1/analyze?url=${url}&performDeepAnalysis=false`);
            expect(response.statusCode).toBe(200);
            expect(await memoryCacheService.get('advancedLinkData')).toBeUndefined();
        });

        it('should handle N concurrent requests to /api/v1/analyze in 1 second', async () => {
            const N = 250_000;
            let globalFetch = global.fetch;
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                text: jest.fn().mockImplementation(() => '<html><body><p>Test paragraph</p></body></html>'),
            });

            await process.nextTick(() => {}); // {@see https://stackoverflow.com/questions/69976411/jest-tlswrap-open-handle-error-using-simple-node-postgres-pool-query-fixed-wit}
            const promises = Array(N).fill(request(app).get('/api/v1/analyze?url=https://github.com/login'));
            const responses = await Promise.allSettled(promises);
            for (const response of responses) {
                expect(response?.value.statusCode).toBe(200);
            }

            global.fetch = globalFetch;
        }, 1 * SECONDS);
    });

    describe('GET /api/v1/advancedLinkData/:id', () => {
        it('should return the advanced link data from the cache with a 200 status code', async () => {
            const id = 'some-existing-id';
            const cachedData = {
                'internal': [
                    {
                        'url': 'https://linkedin.com/',
                        'protocol': 'https:',
                        'redirected': true,
                        'isReachable': true,
                        'status': 200,
                        'error': null
                    },
                    {
                        'url': 'https://linkedin.com/checkpoint/rp/request-password-reset',
                        'protocol': 'https:',
                        'redirected': true,
                        'isReachable': true,
                        'status': 200,
                        'error': null
                    },
                    {
                        'url': 'https://linkedin.com/signup/cold-join',
                        'protocol': 'https:',
                        'redirected': true,
                        'isReachable': true,
                        'status': 200,
                        'error': null
                    },
                ],
                'external': []
            };
            const cachedDataPromise = new Promise(resolve => {
                return resolve(cachedData);
            });
            await memoryCacheService.set(id, cachedDataPromise, 60 * SECONDS);
            await process.nextTick(() => { }); // {@see https://stackoverflow.com/questions/69976411/jest-tlswrap-open-handle-error-using-simple-node-postgres-pool-query-fixed-wit}
            const response = await await request(app).get(`/api/v1/advancedLinkData/${id}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.advancedHrefData).toEqual(cachedData);
        });

        it('should return a 404 status code if the data is not found in the cache', async () => {
            const id = 'some-non-existing-idv';
            await process.nextTick(() => { }); // {@see https://stackoverflow.com/questions/69976411/jest-tlswrap-open-handle-error-using-simple-node-postgres-pool-query-fixed-wit}
            const response = await await request(app).get(`/api/v1/advancedLinkData/${id}`);
            expect(response.statusCode).toBe(404);
        });
    });
});
