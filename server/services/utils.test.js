const { getPageHTML, asyncWait } = require('./utils');

describe('getPageHTML', () => {
    let mockFetch;

    beforeEach(() => {
        mockFetch = jest.fn();
        originalFetch = global.fetch;
        global.fetch = mockFetch;
        fetch.mockImplementation(mockFetch); // Apply the mock to fetch
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.resetAllMocks();
    });

    it('should return the HTML content of a successful response', async () => {
        const mockResponse = { text: () => Promise.resolve('<html></html>') };
        const url = 'https://www.example.com';

        mockFetch.mockResolvedValueOnce(mockResponse); // Mock successful fetch

        const html = await getPageHTML(url);
        expect(html).toBe('<html></html>');
    });

    it('should handle network errors', async () => {
        const url = 'https://invalid-url.com';
        const expectedErrorMessage = 'Failed to fetch'; // Customize this if needed

        mockFetch.mockRejectedValueOnce(new Error(expectedErrorMessage)); // Mock network error

        await expect(getPageHTML(url)).resolves.not.toThrowError();
    });

    it('should handle other errors during text parsing', async () => {
        const mockResponse = { text: () => Promise.reject(new Error('Parsing error')) };
        const url = 'https://www.example.com';

        mockFetch.mockResolvedValueOnce(mockResponse); // Mock successful fetch with parsing error

        await expect(getPageHTML(url)).rejects.toThrowError('Parsing error'); // Specific error message
    });
});

describe('asyncWait', () => {
    it('should wait for the specified milliseconds', async () => {
        const waitTime = 100; // Milliseconds

        const startTime = Date.now();
        await asyncWait(waitTime);
        const endTime = Date.now();

        const elapsedTime = endTime - startTime;
        expect(elapsedTime).toBeGreaterThanOrEqual(waitTime); // Account for potential delays
    });
});
