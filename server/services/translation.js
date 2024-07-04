const /** @type {Record<string, Record<string, string>>} */ savedTranslations = {
    'en': {
        'login': 'login',
        'log in': 'log in',
        'signin': 'signin',
        'sign in': 'sign in',
    },
    'fr': {
        'login': 'se connecter',
        'log in': 'se connecter',
        'signin': 'se connecter',
        'sign in': 'se connecter',
    },
    'es': {
        'login': 'iniciar sesión',
        'log in': 'iniciar sesión',
        'signin': 'iniciar sesión',
        'sign in': 'iniciar sesión',
    },
};

/**
 * Translates a set of phrases into multiple languages using the LibreTranslate API.
 *
 * @param {string[]} languages - An array of language codes (e.g., 'en', 'fr', 'es').
 * @param {string[]} phrases - An array of phrases to be translated.
 * @returns {Promise<string[][]>} - A 2D array of translated phrases, where the outer array represents the languages and the inner array represents the translated phrases.
 */
const translatePhrasesFromEnglish = async (languages, phrases) => {
    const /** @type {string[][]} */ translations = [];

    for (const language of languages) {
        const promises = phrases.map(phrase => translateText(phrase, language));
        const settledPromises = await Promise.allSettled(promises);
        const languageTranslations = settledPromises.map(promise => promise.status === 'fulfilled' ? promise.value : '');
        translations.push(languageTranslations);
    }

    return translations;
};

const translateText = async (text, targetLanguage, sourceLanguage = 'en') => {
    text = text?.toLowerCase();
    targetLanguage = targetLanguage?.toLowerCase();
    if (savedTranslations[targetLanguage]?.[text]) {
        return savedTranslations[targetLanguage][text];
    }
    const body = { q: text, source: sourceLanguage, target: targetLanguage, format: 'text', };
    await process.nextTick(() => { }); // {@see https://stackoverflow.com/questions/69976411/jest-tlswrap-open-handle-error-using-simple-node-postgres-pool-query-fixed-wit}
    const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const { translatedText } = await response.json();
    savedTranslations[targetLanguage][text] = translatedText;
    return translatedText;
};

module.exports = { translatePhrasesFromEnglish };