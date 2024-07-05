/**
 * @type {import("typedef")}
 */
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
// Attempt to load the dotenv package a first time.
require('dotenv').config();

const { getPageScraperService } = require('./services/page-scraper');
const { getMemoryCacheService } = require('./services/memory-cache');
const { getPageScraperRouter } = require('./routers/page-scraper');
const { getHtmlRetrieverService } = require('./services/html-retriever');

// Load the appropriate .env file
const environment = process.env.NODE_ENV || 'development';
if (environment === 'production') {
    require('dotenv').config({ path: '.env.production' });
} else {
    require('dotenv').config({ path: '.env.development' });
}

try {
    require('dotenv').config({ path: `.env.${environment}` });
} catch (error) {
    console.error(`could not load the file '.env.${environment}' :`);
    console.error(error);
    process.exit(1);
}

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

    const pageScraperService = getPageScraperService();
    const htmlRetrieverService = getHtmlRetrieverService();

    const /** @type {MemoryCacheService<WebPageData>} */ memoryCacheService = getMemoryCacheService();
    const pageScraperRouter = getPageScraperRouter(htmlRetrieverService, memoryCacheService, pageScraperService);
    pageScraperRouter.registerRoutes(app);

    const PORT = process.env.SERVER_PORT;
    app.listen(PORT, () => {
        console.log('server is listening on port: ', PORT);
    });
}

run();