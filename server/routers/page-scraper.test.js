const request = require('supertest');
const express = require('express');

const { getBrowserService } = require("../services/browser");
const { getMemoryCacheService } = require("../services/memory-cache");
const { getPageScraperService } = require("../services/page-scraper");
const { getPageScraperRouter } = require("./page-scraper");
const { SECONDS } = require('../services/utils');

// const memoryCacheService = jest.mock('../services/memory-cache');
// const browserService = jest.mock('../services/browser');
// const pageScraperService = jest.mock('../services/page-analysis');

const memoryCacheService = getMemoryCacheService();
const browserService = getBrowserService();
const pageScraperService = getPageScraperService();

describe('PageScraperRouter', () => {
    let /** @type {Express} */ app;
    let /** @type {PageScraperRouter} */ router;

    beforeEach(async () => {
        app = express();
        await browserService.initializeBrowser();
        router = getPageScraperRouter(browserService, memoryCacheService, pageScraperService);
        router.registerRoutes(app);
    });

    describe('GET /api/v1/analyze', () => {
        it('should return a status code of 400 if no URL is provided', async () => {
            const response = await request(app).get('/api/v1/analyze');
            expect(response.statusCode).toBe(400);
        });

        it('should return a status code of 200 if given a working URL', async () => {
            const response = await request(app).get('/api/v1/analyze?url=https://linkedin.com/login');
            expect(response.statusCode).toBe(200);
        }, 10 * SECONDS);

        it('should perform deep analysis and store the advanced link data in the cache', async () => {
        });

        it('should not store the advanced link data in the cache when performDeepAnalysis is false', async () => {
        });
    });

    describe('/api/v1/advancedLinkData/:id', () => {
        it('should return the advanced link data from the cache', async () => {
        });

        it('should return a 404 error if the data is not found in the cache', async () => {
        });
    });
});
