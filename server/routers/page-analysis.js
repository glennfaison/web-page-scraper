/**
 * @type {import("../typedef")}
 */

/**
 * Returns a PageAnalysisService object
 * @param {BrowserService} browserService
 * @param {MemoryCacheService<WebPageData>} memoryCacheService
 * @param {PageAnalysisService} pageAnalysisService
 * @returns {PageAnalysisRouter}
 */
const getPageAnalysisRouter = (browserService, memoryCacheService, pageAnalysisService) => {

    return {
        registerRoutes: (expressRouter) => {
            expressRouter.get('/api/v1/analyze', async (req, res) => {
                let { url } = req.query;
                performDeepAnalysis = req.query.performDeepAnalysis === 'true' ? true : false;
                if (!url) {
                    return res.sendStatus(400);
                }
    
                const page = await browserService.getNewPage();
                await page.goto(url);
                await page.setViewport({ width: 1200, height: 800 });
                await browserService.autoScroll(page);
                const pageHTML = await page.content();
                await page.close();

                const result = await pageAnalysisService.getWebPageData(pageHTML, url, { performDeepAnalysis });
                const advancedHrefDataPromise = result.advancedHrefDataPromise;
                delete result.advancedHrefDataPromise;
                const uuid = crypto.randomUUID();
                if (performDeepAnalysis) {
                    result.getAdvancedLinkData = `${req.protocol}://${req.get('host')}/api/v1/advancedLinkData/${uuid}`;
                    memoryCacheService.set(uuid, advancedHrefDataPromise);
                }
                return res.json(result).status(200);
            });

            expressRouter.get('/api/v1/advancedLinkData/:id', async (req, res) => {
                const { id } = req.params;
                if (!id) {
                    return res.json({ error: 'Missing UUID parameter' }).status(400);
                }
                try {
                    const { payload } = await memoryCacheService.get(id);
                    const advancedHrefData = await payload;
                    return res.json({ advancedHrefData }).status(200);
                } catch (err) {
                    const response = { message: 'could not find data by id ', id, error: err };
                    console.error(response);
                    return res.json(response).status(404);
                }
            });
        },
    };
};

module.exports = {
    getPageAnalysisRouter,
};
