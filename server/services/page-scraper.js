/**
 * @type {import("../typedef")}
 */
const cheerio = require('cheerio');
const { URL } = require('url');
const { translatePhrasesFromEnglish } = require("./translation");

/**
 * Returns a PageScraperService object
 * @returns {PageScraperService}
 */
const getPageScraperService = (translateFromEnglish = translatePhrasesFromEnglish) => {
    /**
     * Retrieves the language tags from an HTML document using Cheerio.
     *
     * @param {cheerio.CheerioAPI} $ - The Cheerio instance representing the HTML document.
     * @returns {string[]} - An array of language tags, including the one set on the <html> tag.
     */
    const getLanguageTags = ($) => {
        const htmlLang = $('html').attr('lang');
        const langTags = $('*[lang]').map((i, el) => $(el).attr('lang')).get();

        return [htmlLang, ...langTags].filter(Boolean);
    };

    /**
     * Check a given page for a login form
     * @param {cheerio.CheerioAPI} $ 
     * @returns {Promise<boolean>}
     */
    const hasLoginForm = ($, electiveKeywords) => {
        let languages = getLanguageTags($);
        languages = [...new Set(languages)];
        const defaultKeywords = ['login', 'log in', 'sign in', 'signin', 'username', 'email', 'connexion', 's\'authentifier'];
        if (!Array.isArray(electiveKeywords)) {
            electiveKeywords = [];
        }
        electiveKeywords.push(...defaultKeywords);
        electiveKeywords = [...new Set(electiveKeywords)];
        
        return new Promise((resolve) => {
            translateFromEnglish(languages, electiveKeywords)
                .then((results) => {
                    for (const arr of results) {
                        electiveKeywords.push(...arr);
                    }
                })
                .then(() => {
                    $('form:has(input[type="password"])').each((_, form) => {
                        const passwordInputs = $(form).find('input[type="password"]');
                        const emailInputs = $(form).find('input[type="email"]');
        
                        // Assume this is not a login form if there's more than one password input
                        if (passwordInputs.length !== 1) {
                            return resolve(false);
                        }
        
                        // If there is one email input and one password input, assume it's a login form
                        if (emailInputs.length === 1 && passwordInputs.length === 1) {
                            return resolve(true);
                        }
        
                        // Check if the form text contains login keywords
                        const formHtml = $(form).html().toLowerCase();
                        const formHtmlContainsAnyElectiveKeywords = electiveKeywords.some(keyword => formHtml.includes(keyword));
        
                        // If there is one password input and the form text contains login keywords, it's a login form
                        if (formHtmlContainsAnyElectiveKeywords && passwordInputs.length === 1) {
                            return resolve(true);
                        }
                    });
                    return resolve(false);
                });
        });
    };

    /**
     * Get hrefs from anchors/links on a page
     * @param {cheerio.CheerioAPI} $ 
     * @param {string} currentUrl
     * @returns {HrefData}
     */
    const getHrefData = ($, currentUrl) => {
        const/** @type {HrefData} */ hrefData = { internal: [], external: [] };
        const m = {};
        const currentUrlObject = new URL(currentUrl);

        $('a').each((_, link) => {
            let href = $(link).attr('href');
            if (!href) {
                return;
            }

            let hrefObject = getAbsoluteUrl(href, currentUrlObject.toJSON());
            const trimmedHref = hrefObject.toJSON();
            if (m[trimmedHref]) {
                return;
            }
            m[trimmedHref] = true;

            if (currentUrlObject.origin === hrefObject.origin) {
                hrefData.internal.push(trimmedHref);
                return;
            }
            hrefData.external.push(trimmedHref);

        });

        return hrefData;
    };

    /**
     * Get all the headings on the page by type (H1 - H6)
     * @param {cheerio.CheerioAPI} $
     * @returns {HeadingData}
     */
    const getHeadingData = ($) => {
        const headingData = {};

        for (let i = 1; i <= 6; i++) {
            const tagName = `h${i}`;
            $(tagName).each((_, heading) => {
                if (!Array.isArray(headingData[tagName])) {
                    headingData[tagName] = [];
                }
                const trimmedHeadingText = $(heading).text()?.trim();
                if (!trimmedHeadingText) {
                    return;
                }
                headingData[tagName].push(trimmedHeadingText);
            });
        }
        return headingData;
    };

    /**
     * Find the DocType of the web page
     * @param {cheerio.CheerioAPI} $ 
     * @returns {string}
     */
    const getDocType = ($) => {
        const doctype = $.root().contents().first();
        const docTypeString = doctype.toString();
        const docTypeRegExp = /^<!DOCTYPE\s+([^>]+)>/i;

        const match = docTypeString.match(docTypeRegExp);
        return match ? match[1] : null;
    };

    /**
     * Find the Title of the web page
     * @param {cheerio.CheerioAPI} $ 
     * @returns {string}
     */
    const getPageTitle = ($) => {
        return $('title').text()?.trim();
    };

    /**
     * Get the absolute URL from a (possibly) relative URL
     * @param {string} relativeUrl relative URL
     * @param {string} domainUrl URL of the web page
     * @returns {string}
     */
    const getAbsoluteUrl = (relativeUrl, domainUrl) => {
        let domainUrlObject;
        let newUrl = relativeUrl;

        try {
            if (relativeUrl.startsWith('/')) {
                domainUrlObject = new URL(domainUrl);
                newUrl = domainUrlObject.origin + relativeUrl;
            }
            return new URL(newUrl);
        } catch (err) {
            try {
                domainUrlObject = !!domainUrlObject ? domainUrlObject : new URL(domainUrl);
                return new URL(domainUrlObject.toJSON() + relativeUrl);
            } catch (error) {
                throw err;
            }
        }
    };

    /**
     * Get anchors on a page
     * @param {cheerio.CheerioAPI} $
     * @param {HrefData} [hrefData]
     * @returns {Promise<AdvancedHrefData>}
     */
    const getAdvancedHrefData = async (hrefData) => {
        const internalPromises = hrefData.internal.map(href => getAdvancedHrefDataItem(href));
        const externalPromises = hrefData.external.map(href => getAdvancedHrefDataItem(href));

        const internalResults = await Promise.allSettled(internalPromises);
        const externalResults = await Promise.allSettled(externalPromises);

        const internal = internalResults.map(result => result.value);
        const external = externalResults.map(result => result.value);

        return { internal, external };
    };

    /**
     * Get information about a URL/href
     * @param {string} href
     * @returns {AdvancedHrefDataItem}
     */
    const getAdvancedHrefDataItem = async (href) => {
        const { protocol } = new URL(href);
        const linkData = { url: href, protocol, redirected: false, isReachable: false, status: null, error: null };

        try {
            const { ok, status, redirected } = await fetch(href);
            linkData.status = status;
            if (ok) {
                linkData.redirected = redirected || false;
                linkData.isReachable = true;
            } else {
                linkData.error = `HTTP status code: ${status}`;
            }
        } catch (err) {
            linkData.error = err.message;
        }

        return linkData;
    };

    /**
     * Perform analysis of the web page whose URL is provided.
     * @param {string} pageHTML HTML string from the page
     * @param {string} pageUrl URL of the page
     * @param {PageScraperServiceConfig} [config] 
     * @returns {WebPageData}
     */
    const getWebPageData = async (pageHTML, pageUrl, config = { performDeepAnalysis: false }) => {
        const $ = cheerio.load(pageHTML, { xmlMode: true });

        const result = {};
        try {
            result.docType = getDocType($);
            result.pageTitle = getPageTitle($);
            result.headingData = getHeadingData($);
            result.hasLoginForm = await hasLoginForm($);
            result.hrefData = getHrefData($, pageUrl);

            if (config.performDeepAnalysis) {
                result.advancedHrefDataPromise = getAdvancedHrefData(result.hrefData);
            }
            return result;
        } catch (err) {
            throw err;
        }
    };

    return { getAbsoluteUrl, getWebPageData };
};

module.exports = {
    getPageScraperService,
};