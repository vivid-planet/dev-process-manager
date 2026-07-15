import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
    title: "dev-process-manager",
    tagline: "A Node.js process manager for local development environments that need multiple processes",
    favicon: "img/favicon.svg",

    // Deployed to GitHub Pages via .github/workflows/deploy-docs.yml.
    url: "https://vivid-planet.github.io",
    baseUrl: "/dev-process-manager/",

    organizationName: "vivid-planet",
    projectName: "dev-process-manager",

    onBrokenLinks: "throw",

    markdown: {
        hooks: {
            onBrokenMarkdownLinks: "warn",
        },
    },

    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    routeBasePath: "/docs",
                    editUrl: "https://github.com/vivid-planet/dev-process-manager/tree/main/docs/",
                },
                blog: false,
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: "img/logo.svg",
        colorMode: {
            defaultMode: "dark",
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: "dev-process-manager",
            logo: {
                alt: "dev-process-manager logo",
                src: "img/logo.svg",
                srcDark: "img/logo-dark.svg",
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "docsSidebar",
                    position: "left",
                    label: "Docs",
                },
                {
                    to: "/docs/api-reference",
                    label: "API",
                    position: "left",
                },
                {
                    to: "/docs/examples",
                    label: "Examples",
                    position: "left",
                },
                {
                    href: "https://www.npmjs.com/package/@comet/dev-process-manager",
                    label: "npm",
                    position: "right",
                },
                {
                    href: "https://github.com/vivid-planet/dev-process-manager",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        { label: "Introduction", to: "/docs/intro" },
                        { label: "Use Cases", to: "/docs/use-cases" },
                        { label: "Getting Started", to: "/docs/getting-started" },
                    ],
                },
                {
                    title: "Reference",
                    items: [
                        { label: "Configuration", to: "/docs/configuration" },
                        { label: "Commands", to: "/docs/commands" },
                        { label: "API Reference", to: "/docs/api-reference" },
                        { label: "Examples", to: "/docs/examples" },
                    ],
                },
                {
                    title: "More",
                    items: [
                        { label: "GitHub", href: "https://github.com/vivid-planet/dev-process-manager" },
                        { label: "npm", href: "https://www.npmjs.com/package/@comet/dev-process-manager" },
                        { label: "Vivid Planet", href: "https://www.vivid-planet.com/" },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Vivid Planet Software GmbH. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ["bash", "json"],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
