import { Daemon } from "../commands/start-daemon.command";
import { ScriptDefinition } from "../script-definition.type";

export function scriptsMatchingPattern(daemon: Daemon, scriptName: string | null): ScriptDefinition[] {
    if (!scriptName || scriptName === "all") {
        // all
        return daemon.scripts;
    }
    return daemon.scripts.filter((script) => {
        if (script.name == scriptName) return true;
        const scriptGroups = Array.isArray(script.group) ? script.group : [script.group];
        if (scriptGroups.includes(scriptName)) return true;
    });
}
