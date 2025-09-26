import { ScriptDefinition } from "./script-definition.type.js";

export interface Config {
    // ID is set by the daemon
    scripts: Omit<ScriptDefinition, "id">[];
}

export function defineConfig(config: Config): Config {
    return config;
}
