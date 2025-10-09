/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
    "*.{ts,tsx,js,jsx,json,css,scss,md}": () => "npm run lint:eslint",
    "*.{ts,tsx}": () => "npm run lint:tsc",
};
