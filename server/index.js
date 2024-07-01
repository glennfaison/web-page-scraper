/**
 * @type {import("typedef")}
 */
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const { getBrowserService } = require('./services/browser');
const { getPageScraperService } = require('./services/page-scraper');
const { getMemoryCacheService } = require('./services/memory-cache');
const { getPageScraperRouter } = require('./routers/page-scraper');

const PORT = process.env.PORT || 3003;


async function run() {
    const app = express();
    app.use(cors());
    const limiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        limit: 60,
        standardHeaders: true, // add the `RateLimit-*` headers to the response
        legacyHeaders: false, // remove the `X-RateLimit-*` headers from the response
    });
    app.use('/api/v1/analyze', limiter);

    app.use('/', express.static('client/build'));

    const browserSvc = getBrowserService();
    await browserSvc.initializeBrowser();
    const pageScraperService = getPageScraperService();
    
    const /** @type {MemoryCacheService<WebPageData>} */ memoryCacheService = getMemoryCacheService();
    const pageScraperRouter = getPageScraperRouter(browserSvc, memoryCacheService, pageScraperService);
    pageScraperRouter.registerRoutes(app);

    app.listen(PORT, () => {
        console.log('server is listening on port: ', PORT);
    });
}

run();