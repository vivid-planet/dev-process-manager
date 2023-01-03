import { existsSync } from "fs";
import path from "path";

let configDirCache: string;
export function findConfigDir(): string {
    if (configDirCache) return configDirCache;
    const pmConfigFileName = "dev-pm.config.js";
    let dir = process.cwd();
    while (!existsSync(`${dir}/${pmConfigFileName}`)) {
        if (dir == "/") {
            throw new Error("Can't find dev-pm.config.js");
        }
        dir = path.dirname(dir);
    }
    configDirCache = dir;
    return dir;
}
