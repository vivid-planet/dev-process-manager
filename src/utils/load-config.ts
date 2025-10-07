import { loadConfig as unconfigLoadConfig } from "unconfig";

import { Config } from "../config.js";

export async function loadConfig() {
    const config = await unconfigLoadConfig<Config>({
        sources: [
            {
                files: "dev-pm.config",
                extensions: ["ts", "mts", "cts", "js", "mjs", "cjs", "json"],
            },
        ],
        merge: false,
    });
    if (!config.sources.length) {
        throw new Error("dev-pm.config file not found");
    }
    if (Object.keys(config.config).length === 0) {
        throw new Error("dev-pm.config doesn't export a config object, make sure to add a default export");
    }
    if (!config.config.scripts) {
        throw new Error("dev-pm.config doesn't include required scripts");
    }
    return config;
}
