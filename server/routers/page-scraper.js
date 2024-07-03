/**
 * @type {import('../typedef')}
 * @typedef {import('../services/html-retriever').Service} HtmlRetriever.Service
 */

/**
 * Returns a PageScraperService object
 * @param {HtmlRetriever.Service} htmlRetrieverService
 * @param {MemoryCacheService<Promise<WebPageData>>} memoryCacheService
 * @param {PageScraperService} pageScraperService
 * @returns {PageScraperRouter}
 */
const getPageScraperRouter = (htmlRetrieverService, memoryCacheService, pageScraperService) => {

    return {
        registerRoutes: (expressRouter) => {
            expressRouter.get('/api/v1/analyze', async (req, res) => {
                let { url, performDeepAnalysis } = req.query;
                performDeepAnalysis = performDeepAnalysis === 'true' ? true : false;
                if (!url) {
                    return res.sendStatus(400);
                }

                const pageHtml = await htmlRetrieverService.getHtml(url, { useBrowser: performDeepAnalysis });
                const result = await pageScraperService.getWebPageData(pageHtml, url, { performDeepAnalysis });
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
                    const cachedData = await memoryCacheService.get(id);
                    if (!cachedData) {
                        const response = { message: 'could not find data by id', id };
                        return res.status(404).json(response);
                    }
                    const advancedHrefData = await cachedData.payload;
                    return res.status(200).json({ advancedHrefData });
                } catch (err) {
                    const response = { error: err.message };
                    return res.status(500).json(response);
                }
            });
        },
    };
};

module.exports = {
    getPageScraperRouter,
};
