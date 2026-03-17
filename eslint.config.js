import nestjsConfig from "@comet/eslint-config/nestjs.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...nestjsConfig,
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                projectService: {
                    allowDefaultProject: ["src/*.test.ts", "src/*/*.test.ts"],
                },
            },
        },
        rules: {
            "@comet/no-other-module-relative-import": "off",
        },
    },
];
