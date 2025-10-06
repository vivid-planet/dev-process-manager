import { Daemon } from "../commands/start-daemon.command.js";
import { Script } from "./script.js";

export interface ScriptsMatchingPatternOptions {
    patterns: string[];
}

export function scriptsMatchingPattern(daemon: Daemon, { patterns }: ScriptsMatchingPatternOptions): Script[] {
    const uniquePatterns = [...new Set(patterns.map((pattern) => pattern.split(",")).flat())];
    const ids = uniquePatterns.filter((pattern) => pattern && !isNaN(+pattern)).map(Number) || [];
    const names = uniquePatterns.filter((pattern) => pattern && isNaN(+pattern)) || [];

    return daemon.scripts.filter((script) => {
        if (ids.length === 0 && names.length === 0) return true;

        const idExists = ids.some((id) => script.id === id);
        const nameExists = names.some((name) => {
            if (name === "all") return true;
            if (name[0] === "@" && script.groups.includes(name.substring(1))) return true;
            return script.name === name;
        });

        return idExists || nameExists;
    });
}
