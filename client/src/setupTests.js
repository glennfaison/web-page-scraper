// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const originalConsoleError = console.error;
console.error = function (...data) {
  if (typeof data[0]?.toString === 'function' && data[0].toString().includes('Error: Could not parse CSS stylesheet')) return;
  originalConsoleError(...data);
};