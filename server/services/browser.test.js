const { getBrowserService } = require('./browser');
const { SECONDS } = require('./utils');

describe('BrowserService', () => {
    let /** @type {BrowserService} */ browserService;

    beforeEach(async() => {
        browserService = getBrowserService();
        await browserService.initializeBrowser();
    }, 10 * SECONDS);

    afterEach(async () => {
        await browserService.closeBrowser();
    });

    test('should initialize a new browser instance', async () => {
        const browser = browserService.getBrowser();
        expect(browser).not.toBeNull();
    }, 10 * SECONDS);

    test('should create a new page instance', async () => {
        const page = await browserService.getNewPage();
        expect(page).not.toBeNull();
    }, 10 * SECONDS);

    test('should close the browser instance', async () => {
        await browserService.closeBrowser();
        const browser = browserService.getBrowser();
        expect(browser).toBeNull();
    }, 10 * SECONDS);

    test('should auto-scroll a page', async () => {
        const page = await browserService.getNewPage();
        await page.goto('https://github.com/login');
        await page.setViewport({ width: 100, height: 500 });
        await browserService.autoScroll(page);
        const currentScrollY = await page.evaluate(() => window.scrollY);
        expect(currentScrollY).toBeGreaterThan(0);
    }, 20 * SECONDS);
});
