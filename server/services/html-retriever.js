const puppeteer = require('puppeteer');

let /** @type {puppeteer.Browser} */ browserInstance;

/**
 * Fetches the HTML content of a URL.
 * 
 * @param {string} url The URL to fetch.
 * @throws {Error} If the fetch fails.
 * @returns {Promise<string>} The fetched HTML content.
 */
async function getHtmlWithFetch(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch url: ${url}, status: ${response.status}`);
    }
    return await response.text();
}

async function autoScroll (page, maxScrolls=100) {
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
}

/**
 * Fetches the HTML content of a URL using Puppeteer.
 * 
 * @param {string} url The URL to fetch.
 * @param {puppeteer.Browser} browser The Puppeteer browser instance.
 * @throws {Error} If Puppeteer operations fail.
 * @returns {Promise<string>} The fetched HTML content.
 */
async function getHtmlWithPuppeteer(url, browser) {
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1200, height: 800 });
    await autoScroll(page);
    const html = await page.content();
    await page.close();
    return html;
}

/**
 * @typedef {object} Config
 * @property {boolean} useBrowser (default: false) Whether to use Puppeteer for fetching.
 */

/**
 * Creates and returns a service object for retrieving HTML content.
 * 
 * @typedef {object} Service
 * @property {(url: string, config: Config) => Promise<string>} getHtml - Retrieves the HTML content of a URL.
 * @property {function(): Promise<void>} dispose - Disposes of any used resources.
 * 
 * @returns {Service} The HTML retriever service object.
 */
function getHtmlRetrieverService(browser) {
    if (browser) {
        browserInstance = browser;
    }
    return {
        /**
         * Retrieves the HTML content of a URL.
         * 
         * @param {string} url The URL to fetch.
         * @param {Config} config (optional) Configuration object.
         * @throws {Error} If fetching fails.
         * @returns {Promise<string>} The fetched HTML content.
         */
        async getHtml(url, config = { useBrowser: false }) {
            if (config.useBrowser) {
                if (!browserInstance) {
                    browserInstance = await puppeteer.launch();
                }
                return getHtmlWithPuppeteer(url, browserInstance);
            }
            return getHtmlWithFetch(url);
        },
        /**
         * Disposes of the Puppeteer browser instance and other resources.
         * 
         * @throws {Error} If closing the browser fails.
         * @returns {Promise<void>}
         */
        async dispose() {
            if (browserInstance) {
                await browserInstance.close();
                browserInstance = null;
            }
        },
    };
}

module.exports = { getHtmlRetrieverService };
