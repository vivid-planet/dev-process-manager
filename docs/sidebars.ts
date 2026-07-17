import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
    docsSidebar: [
        "intro",
        "use-cases",
        "comparison",
        {
            type: "category",
            label: "Guides",
            collapsed: false,
            items: ["getting-started", "configuration", "commands"],
        },
        "examples",
    ],
};

export default sidebars;
