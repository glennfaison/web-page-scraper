const { getPageScraperService } = require('./page-scraper');
const { getPageHTML, SECONDS } = require('./utils');

let globalFetch = global.fetch;

describe('getWebPageData', () => {
    let /** @type {PageScraperService} */ pageScraperService = null;

    beforeAll(async () => {
        pageScraperService = getPageScraperService();
    });

    afterAll(() => {
        pageScraperService = null;
    });
    
    it('should detect a login form in a page with French text', async () => {
        const pageHtml = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Formulaire de connexion</title>
            </head>
            <body>
                <h1>Connexion</h1>
                <a href="http://example.com">Internal Link</a><a href="https://google.com">External Link</a>
                <form>
                    <label for="username">Nom d'utilisateur :</label>
                    <input type="text" id="username" name="username" required>

                    <label for="password">Mot de passe :</label>
                    <input type="password" id="password" name="password" required>

                    <button type="submit">Se connecter</button>
                </form>
            </body>
            </html>
            `;
        const currentUrl = 'http://example.com';

        const mockFetch = jest.fn();
        globalFetch = global.fetch;
        global.fetch = mockFetch;
        mockFetch.mockImplementation((url) => {
            if (url === 'http://example.com/') {
                return Promise.resolve({ ok: true, status: 200 });
            } else if (url === 'https://google.com/') {
                return Promise.resolve({ ok: true, status: 200 });
            } else {
                return Promise.reject(new Error('Fetch error'));
            }
        });

        const webPageData = await pageScraperService.getWebPageData(pageHtml, currentUrl);

        expect(webPageData.hasLoginForm).toBe(true);
        global.fetch = globalFetch;
        jest.resetAllMocks();
    });
    
    it('should detect a login form in a page with English text', async () => {
        const pageHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Login Form</title>
            </head>
            <body>
                <h1>Log In</h1>
                <a href="http://example.com">Internal Link</a><a href="https://google.com">External Link</a>
                <form>
                    <label for="username">Username :</label>
                    <input type="text" id="username" name="username" required>

                    <label for="password">Password :</label>
                    <input type="password" id="password" name="password" required>

                    <button type="submit">Log In</button>
                </form>
            </body>
            </html>
            `;
        const currentUrl = 'http://example.com';

        const mockFetch = jest.fn();
        globalFetch = global.fetch;
        global.fetch = mockFetch;
        mockFetch.mockImplementation((url) => {
            if (url === 'http://example.com/') {
                return Promise.resolve({ ok: true, status: 200 });
            } else if (url === 'https://google.com/') {
                return Promise.resolve({ ok: true, status: 200 });
            } else {
                return Promise.reject(new Error('Fetch error'));
            }
        });

        const webPageData = await pageScraperService.getWebPageData(pageHtml, currentUrl);

        expect(webPageData.hasLoginForm).toBe(true);
        global.fetch = globalFetch;
        jest.resetAllMocks();
    });

    describe('advancedHrefDataPromise', () => {
        let mockFetch;
        let /** @type {PageScraperService} */ pageScraperService;
        const pageHtml = '<a href="http://example.com">Internal Link</a><a href="https://google.com">External Link</a>';
        const currentUrl = 'http://example.com';
    
        beforeAll(() => {
            mockFetch = jest.fn();
            globalFetch = global.fetch;
            global.fetch = mockFetch;
            pageScraperService = getPageScraperService();
        });
    
        afterAll(() => {
            global.fetch = globalFetch;
            jest.resetAllMocks();
            pageScraperService = null;
        });
    
        it('should return valid internal and external links', async () => {
            mockFetch.mockImplementation((url) => {
                if (url === 'http://example.com/') {
                    return Promise.resolve({ ok: true, status: 200 });
                } else if (url === 'https://google.com/') {
                    return Promise.resolve({ ok: true, status: 200 });
                } else {
                    return Promise.reject(new Error('Fetch error'));
                }
            });
    
            const webPageData = await pageScraperService.getWebPageData(pageHtml, currentUrl, { performDeepAnalysis: true });
            const result = await webPageData.advancedHrefDataPromise;
    
            expect(result.internal).toEqual([
                { url: 'http://example.com/', protocol: 'http:', redirected: false, status: 200, isReachable: true, error: null },
            ]);
            expect(result.external).toEqual([
                { url: 'https://google.com/', protocol: 'https:', redirected: false, status: 200, isReachable: true, error: null },
            ]);
        });
    
        it('should handle unreachable internal and external links', async () => {
            mockFetch.mockImplementation((url) => {
                if (url === 'http://example.com/') {
                    return Promise.resolve({ ok: false, status: 404 });
                } else if (url === 'https://google.com/') {
                    return Promise.resolve({ ok: false, status: 500 });
                } else {
                    return Promise.reject(new Error('Fetch error'));
                }
            });
    
            const webPageData = await pageScraperService.getWebPageData(pageHtml, currentUrl, { performDeepAnalysis: true });
            const result = await webPageData.advancedHrefDataPromise;
    
            expect(result.internal).toEqual([
                { url: 'http://example.com/', protocol: 'http:', redirected: false, status: 404, isReachable: false, error: 'HTTP status code: 404' },
            ]);
            expect(result.external).toEqual([
                { url: 'https://google.com/', protocol: 'https:', redirected: false, status: 500, isReachable: false, error: 'HTTP status code: 500' },
            ]);
        });
    
        it('should handle fetch errors', async () => {
            mockFetch.mockImplementation((url) => {
                if (url === 'http://example.com/') {
                    return Promise.reject(new Error('Network error'));
                } else if (url === 'https://google.com/') {
                    return Promise.reject(new Error('Timeout error'));
                } else {
                    return Promise.reject(new Error('Fetch error'));
                }
            });
    
            const webPageData = await pageScraperService.getWebPageData(pageHtml, currentUrl, { performDeepAnalysis: true });
            const result = await webPageData.advancedHrefDataPromise;
    
            expect(result.internal).toEqual([
                { url: 'http://example.com/', protocol: 'http:', redirected: false, status: null, isReachable: false, error: new Error('Network error').message },
            ]);
            expect(result.external).toEqual([
                { url: 'https://google.com/', protocol: 'https:', redirected: false, status: null, isReachable: false, error: new Error('Timeout error').message },
            ]);
        });
    });
});

describe('getAbsoluteUrl', () => {
    let /** @type {PageScraperService} */ pageScraperService = null;

    beforeEach(() => {
        pageScraperService = getPageScraperService();
    });

    afterEach(() => {
        pageScraperService = null;
    });

    test('should return a valid URL object for a relative URL', () => {
        const domainUrl = 'https://www.example.com/path/to/page';
        const url = '/some-relative-path';
        const urlObject = pageScraperService.getAbsoluteUrl(url, domainUrl);

        expect(urlObject).toBeInstanceOf(URL);
        expect(urlObject.href).toBe('https://www.example.com/some-relative-path');
        expect(urlObject.origin).toBe('https://www.example.com');
        expect(urlObject.pathname).toBe('/some-relative-path');
    });

    test('should return a valid URL object for an absolute URL', () => {
        const domainUrl = 'https://www.example.com/path/to/page';
        const url = 'https://www.other-site.com/some-page';
        const urlObject = pageScraperService.getAbsoluteUrl(url, domainUrl);

        expect(urlObject).toBeInstanceOf(URL);
        expect(urlObject.href).toBe('https://www.other-site.com/some-page');
        expect(urlObject.origin).toBe('https://www.other-site.com');
        expect(urlObject.pathname).toBe('/some-page');
    });
});

describe('Live Tests (NO MOCKS)', () => {
    let /** @type {PageScraperService} */ pageScraperService = null;

    beforeAll(async () => {
        pageScraperService = getPageScraperService();
    });

    afterAll(() => {
        pageScraperService = null;
    });

    it('`getWebPageData` should not throw errors for valid login pages', async () => {
        const urls = ['https://github.com/login', 'https://linkedin.com/login'];

        for (const url of urls) {
            await process.nextTick(() => {}); // {@see https://stackoverflow.com/questions/69976411/jest-tlswrap-open-handle-error-using-simple-node-postgres-pool-query-fixed-wit}
            const pageHTML = await getPageHTML(url);
            expect(async () => await pageScraperService.getWebPageData(pageHTML, url)).not.toThrowError();
        }
    }, 20 * SECONDS);

    it('`getWebPageData` should return an object whose `hasLoginForm` property should be true for login pages', async () => {
        const urls = [
            'https://github.com/login',
            'https://linkedin.com/login',
            'https://accounts.google.com/signin',
            'https://www.facebook.com/login/',
            // "https://twitter.com/login",
            // "https://www.amazon.com/ap/signin",
            // "https://www.instagram.com/accounts/login/",
            // "https://www.reddit.com/login",
            // "https://www.pinterest.com/login/",
        ];
        const results = [];
        for (const url of urls) {
            const pageHTML = await getPageHTML(url);

            const result = await pageScraperService.getWebPageData(pageHTML, url);
            results.push(result);
        }

        const allLoginFormsFound = results.every((result) => result?.hasLoginForm === true);
        expect(allLoginFormsFound).toBe(true);
    }, 20 * SECONDS);
});
