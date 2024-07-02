/**
 * @typedef {object} PageScraperServiceConfig
 * @property {boolean} [config.performDeepAnalysis=false]
 */

/**
 * @typedef {object} HeadingData
 * @property {string[]} h1
 * @property {string[]} h2
 * @property {string[]} h3
 * @property {string[]} h4
 * @property {string[]} h5
 * @property {string[]} h6
 */

/**
 * @typedef {object} HrefData
 * @property {string[]} internal
 * @property {string[]} external
 */

/**
 * @typedef {object} AdvancedHrefDataItem
 * @property {string} url
 * @property {string} protocol
 * @property {boolean} redirected
 * @property {boolean} isReachable
 * @property {number} status
 * @property {string} error
 */

/**
 * @typedef {object} AdvancedHrefData
 * @property {AdvancedHrefDataItem[]} internal
 * @property {AdvancedHrefDataItem[]} external
 */

/**
 * @typedef {object} WebPageData
 * @property {string} docType value from the !DOCTYPE tag
 * @property {string} pageTitle Title of the page
 * @property {HeadingData} headingData Headings on the page, from H1 to H6
 * @property {HrefData} hrefData hrefs on the page, internal and external
 * @property {boolean} hasLoginForm true if a login/signin form was found, false otherwise
 * @property {Promise<AdvancedHrefData>} advancedHrefDataPromise a Promise that resolves to the advanced heading data
 */

/**
 * @typedef {object} PageScraperService
 * @property {(pageHTML: string, pageUrl: string, config?: any) => Promise<WebPageData>} getWebPageData
 * @property {(relativeUrl: string, domainUrl: string) => string} getAbsoluteUrl
 */

/**
 * @template T
 * @typedef {{payload: T; createdAt: number; expiresAt: number}} MemoryCacheEntity<T>
 * @typedef {Record<string, MemoryCacheEntity<T>>} MemoryCache<T>
 */

/**
 * @template T
 * @typedef {object} MemoryCacheService<T>
 * @property {(uuid: import("crypto").UUID) => Promise<MemoryCacheEntity<T>>} get - Retrieves the stored data for the provided UUID
 * @property {(uuid: import("crypto").UUID, payload: T) => Promise<void>} set - Stores the provided payload with the given UUID
 * @property {() => void} dispose - Clears the memory used
 * @property {(milliseconds: number) => void} setCleanupInterval - Set the time interval for running the cleanup function
 */

/**
 * @typedef {object} BrowserService
 * @property {() => Browser} getBrowser - Returns a Puppeteer browser instance
 * @property {() => Promise<void>} initializeBrowser - Initializes the Puppeteer browser instance
 * @property {() => Promise<Page>} getNewPage - Returns a new Puppeteer page instance
 * @property {() => Promise<void>} closeBrowser - Closes the browser instance
 * @property {(page: import('puppeteer').Page, maxScrolls=100) => Promise<void>} autoScroll - Scrolls the page automatically
 */

/**
 * @typedef {object} PageScraperRouter
 * @property {(expressRouter: import('express').Express) => void} registerRoutes - Registers HTTP(S) routes
 */