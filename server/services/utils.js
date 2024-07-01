const getPageHTML = async (url) => {
    try {
        const response = await fetch(url);
        return response.text();
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Error:', error);
        }
    }
};

const asyncWait = (waitMS) => {
    return new Promise(resolve => setTimeout(resolve, waitMS));
};

const SECONDS = 1000;

module.exports = {
    getPageHTML,
    SECONDS,
    asyncWait,
};