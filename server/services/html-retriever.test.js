const puppeteer = require('puppeteer');
const { getHtmlRetrieverService } = require('./html-retriever');
const /** @type {puppeteer} */ mockPuppeteer = {};

describe('getHtmlRetrieverService', () => {
    const dummyHtml = '<!DOCTYPE html><html><body><p>Test</p></body></html>';
    const puppeteerLaunch = mockPuppeteer.launch;
    const puppeteerClose = mockPuppeteer.close;
    const globalFetch = global.fetch;

    let /** @type {import('./html-retriever').Service} */ service;
    let /** @type {puppeteer.Browser} */ mockBrowser;
    let /** @type {puppeteer.Page} */ mockPage;

    beforeEach(() => {
        mockPage = {
            goto: jest.fn().mockResolvedValue(),
            setViewport: jest.fn().mockResolvedValue(),
            content: jest.fn().mockResolvedValue(dummyHtml),
            evaluate: jest.fn().mockResolvedValue([]),
            close: jest.fn().mockResolvedValue(),
        };
        mockBrowser = {
            newPage: jest.fn().mockResolvedValue(mockPage),
            close: jest.fn().mockResolvedValue(),
        };
        mockPuppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);
        service = getHtmlRetrieverService(mockBrowser);
    });

    afterEach(() => {
        jest.clearAllMocks();
        mockPuppeteer.launch = puppeteerLaunch;
        mockPuppeteer.close = puppeteerClose;
    });

    describe('getHtml', () => {
        it('should use fetch by default', async () => {
            const mockFetch = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue(dummyHtml) });
            global.fetch = mockFetch;

            await service.getHtml('https://www.example.com');
            global.fetch = globalFetch;

            expect(mockFetch).toHaveBeenCalledWith('https://www.example.com');
            expect(mockPuppeteer.launch).not.toHaveBeenCalled();
        });

        it('should use Puppeteer when useBrowser is true', async () => {
            await service.getHtml('https://www.example.com', { useBrowser: true });

            expect(mockPage.goto).toHaveBeenCalledWith('https://www.example.com');
            expect(mockPage.setViewport).toHaveBeenCalled();
            expect(mockPage.content).toHaveBeenCalled();
        });

        it('throws error on fetch failure', async () => {
            const errorMsg = 'Fetch failed';
            global.fetch = jest.fn().mockRejectedValueOnce(new Error(errorMsg));

            await expect(service.getHtml('https://www.example.com')).rejects.toThrow(errorMsg);
            global.fetch = globalFetch;
        });

        it('throws error on Puppeteer launch failure', async () => {
            const errorMsg = 'Puppeteer launch failed';
            await service.dispose();
            jest.spyOn(puppeteer, 'launch').mockImplementation(async () => { throw new Error(errorMsg) });
            await expect(service.getHtml('https://www.example.com', { useBrowser: true })).rejects.toThrow(errorMsg);
        });
    });

    describe('dispose', () => {
        it('should close Puppeteer browser', async () => {
            await service.dispose();
            expect(mockBrowser.close).toHaveBeenCalled();
        });

        it('should not throw error if browser is not launched', async () => {
            await expect(service.dispose()).resolves.not.toThrow();
        });
    });
});
