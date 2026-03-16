import { createConnection } from "net";

export function isDaemonRunning(socketPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            client.destroy();
            resolve(false);
        }, 5000);
        const client = createConnection(socketPath);
        client.on("connect", () => {
            clearTimeout(timeout);
            client.destroy();
            resolve(true);
        });
        client.on("error", () => {
            clearTimeout(timeout);
            client.destroy();
            resolve(false);
        });
    });
}
