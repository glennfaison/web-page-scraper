// eslint.config.js

const jsdoc = require('eslint-plugin-jsdoc');

module.exports = [
    {
        files: ['**/**.js'],
        plugins: {
            jsdoc: jsdoc
        },
        rules: {
            'jsdoc/require-description': 'error',
            'jsdoc/check-values': 'error',
            // Enforce consistent use of double quotes
            'quotes': ['warn', 'single'],
        
            // Enforce 4-space indentation (replace spaces with tabs for actual tab indentation)
            'indent': ['error', 4],
        }
    }
];