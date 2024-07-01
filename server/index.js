/**
 * @type {import("typedef")}
 */
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const { getBrowserService } = require('./services/browser');
const { getPageAnalysisService } = require('./services/page-analysis');
const { getMemoryCacheService } = require('./services/memory-cache');
const { getPageAnalysisRouter } = require('./routers/page-analysis');

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
    const pageAnalysisService = getPageAnalysisService();
    
    const /** @type {MemoryCacheService<WebPageData>} */ memoryCacheService = getMemoryCacheService();
    const pageAnalysisRouter = getPageAnalysisRouter(browserSvc, memoryCacheService, pageAnalysisService);
    pageAnalysisRouter.registerRoutes(app);

    app.listen(PORT, () => {
        console.log('server is listening on port: ', PORT);
    });
}

run();