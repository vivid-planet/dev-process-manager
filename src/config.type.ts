import { ScriptDefinition } from "./script-definition.type";

export interface Config {
    // ID is set by the daemon
    scripts: Omit<ScriptDefinition, "id">[];
}
