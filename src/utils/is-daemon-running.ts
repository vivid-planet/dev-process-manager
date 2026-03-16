import { createConnection } from "net";

export function isDaemonRunning(socketPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const client = createConnection(socketPath);
        client.on("connect", () => {
            client.destroy();
            resolve(true);
        });
        client.on("error", () => {
            resolve(false);
        });
    });
}
