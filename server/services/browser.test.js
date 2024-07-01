const { getBrowserService } = require('./browser');
const { SECONDS } = require('./utils');

describe('BrowserService', () => {
    let browserService;

    beforeEach(() => {
        browserService = getBrowserService();
    });

    afterEach(async () => {
        await browserService.closeBrowser();
    });

    test('should initialize a new browser instance', async () => {
        await browserService.initializeBrowser();
        const browser = browserService.getBrowser();
        expect(browser).not.toBeNull();
    });

    test('should create a new page instance', async () => {
        await browserService.initializeBrowser();
        const page = await browserService.getNewPage();
        expect(page).not.toBeNull();
    });

    test('should close the browser instance', async () => {
        await browserService.initializeBrowser();
        await browserService.closeBrowser();
        const browser = browserService.getBrowser();
        expect(browser).toBeNull();
    });

    test('should auto-scroll a page', async () => {
        await browserService.initializeBrowser();
        const page = await browserService.getNewPage();
        await page.goto('https://github.com/login');
        await page.setViewport({ width: 100, height: 500 });
        await browserService.autoScroll(page);
        const currentScrollY = await page.evaluate(() => window.scrollY);
        expect(currentScrollY).toBeGreaterThan(0);
    }, 20 * SECONDS);
});
