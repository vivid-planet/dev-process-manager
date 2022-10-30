import { createConnection } from "net";

import { StatusCommandOptions } from "../daemon-command/status.daemon-command";
import { autoStartDaemon } from "./auto-start-deamon";

export const status = async (options: StatusCommandOptions): Promise<void> => {
    await autoStartDaemon();

    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        client.write(`status ${JSON.stringify(options)}`);
    });
    client.on("data", (data) => {
        process.stdout.write(data);
    });
};
