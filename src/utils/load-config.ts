import { loadConfig as unconfigLoadConfig } from "unconfig";

import { Config } from "../config.js";

export async function loadConfig() {
    return unconfigLoadConfig<Config>({
        sources: [
            {
                files: "dev-pm.config",
                extensions: ["ts", "mts", "cts", "js", "mjs", "cjs", "json"],
            },
        ],
        merge: false,
    });
}
