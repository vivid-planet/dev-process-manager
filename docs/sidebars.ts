import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
    docsSidebar: [
        "intro",
        "use-cases",
        {
            type: "category",
            label: "Guides",
            collapsed: false,
            items: ["getting-started", "configuration", "commands"],
        },
        "api-reference",
        "examples",
    ],
};

export default sidebars;
