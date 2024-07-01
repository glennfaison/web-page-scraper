/**
 * @type {import("../typedef")}
 */
const { launch } = require('puppeteer');


/**
 * Returns a BrowserService object
 * @returns {BrowserService}
 */
const getBrowserService = () => {
    let /** @type {import("puppeteer").Browser} */ browser = null;

    return {
        getBrowser: () => browser,
        initializeBrowser: async () => {
            browser = await launch({ headless: 'new' });
        },
        getNewPage: async () => {
            return await browser.newPage();
        },
        closeBrowser: async () => {
            if (!browser) {
                return;
            }
            await browser.close();
            browser = null;
        },
        autoScroll: async (page, maxScrolls=100) => {
            /* istanbul ignore next */
            await page.evaluate(async (maxScrolls) => {
                await new Promise((resolve) => {
                    var totalHeight = 0;
                    var distance = 100;
                    var scrolls = 0;  // scrolls counter
                    var timer = setInterval(() => {
                        var scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        scrolls++;  // increment counter
    
                        // stop scrolling if reached the end or the maximum number of scrolls
                        if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            }, maxScrolls);  // pass maxScrolls to the function
        },
    };
};

module.exports.getBrowserService = getBrowserService;