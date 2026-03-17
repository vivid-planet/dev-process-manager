import nestjsConfig from "@comet/eslint-config/nestjs.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...nestjsConfig,
    {
        rules: {
            "@comet/no-other-module-relative-import": "off",
        },
    },
];
