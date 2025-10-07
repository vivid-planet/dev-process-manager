/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
    "*.{ts,tsx,js,jsx,json,css,scss,md}": () => "npx yarn lint:eslint",
    "*.{ts,tsx}": () => "npx yarn lint:tsc",
};
