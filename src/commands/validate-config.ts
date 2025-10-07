import { loadConfig } from "../utils/load-config.js";

/**
 * Load config and output errors if any on console and exit process
 */
export async function validConfigOrExit() {
    try {
        await loadConfig();
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}
