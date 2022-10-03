import { Daemon } from "../commands/start-daemon.command";
import { Script } from "./script";

export function scriptsMatchingPattern(daemon: Daemon, names: string[]): Script[] {
    if (names.length == 0 || names.includes("all")) {
        // all
        return daemon.scripts;
    }
    return daemon.scripts.filter((script) => {
        return names.some((name) => {
            if (name[0] === "@") {
                if (script.groups.includes(name.substring(1))) return true;
            } else {
                if (script.name == name) return true;
            }
            return false;
        });
    });
}
