const { translatePhrasesFromEnglish } = require('./translation');

describe('translatePhrasesFromEnglish', () => {
  it('should translate phrases to multiple languages', async () => {
    const languages = ['en', 'fr', 'es'];
    const phrases = ['login', 'log in', 'sign in', 'signin'];

    const translations = await translatePhrasesFromEnglish(languages, phrases);

    expect(translations).toHaveLength(3);
    expect(translations[0]).toHaveLength(4);
    expect(translations[1]).toHaveLength(4);
    expect(translations[2]).toHaveLength(4);
  });

  it('should handle errors during translation', async () => {
    const languages = ['en', 'fr', 'es'];
    const phrases = ['one', 'two', 'three', 'four'];

    // Mock the fetch function to simulate an error
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.reject(new Error('API error'))
    );

    const translations = await translatePhrasesFromEnglish(languages, phrases);

    expect(translations).toHaveLength(3);
    expect(translations[0]).toEqual(['', '', '', '']);
    expect(translations[1]).toEqual(['', '', '', '']);
    expect(translations[2]).toEqual(['', '', '', '']);

    // Restore the original fetch function
    global.fetch.mockRestore();
  });
});
