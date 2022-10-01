import { Daemon } from "../commands/start-daemon.command";
import { Script } from "./script";

export function scriptsMatchingPattern(daemon: Daemon, scriptName: string | null): Script[] {
    if (!scriptName || scriptName === "all") {
        // all
        return daemon.scripts;
    }
    return daemon.scripts.filter((script) => {
        if (script.name == scriptName) return true;
        if (script.groups.includes(scriptName)) return true;
    });
}
