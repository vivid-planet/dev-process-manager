import { dirname } from "path";
import { loadConfig as unconfigLoadConfig } from "unconfig";

import type { Config } from "../config.js";

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

// The project root is the directory containing the config file. All commands change into it, which also keeps the
// path of the .pm.sock socket file short: unix socket paths must fit into sockaddr_un.sun_path (108 bytes on Linux,
// 104 bytes on macOS), so an absolute path in a deeply nested project fails with EINVAL.
export function chdirToProjectRoot(configSource: string): void {
    process.chdir(dirname(configSource));
}
