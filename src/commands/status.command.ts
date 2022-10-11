import { createConnection } from "net";

import { autoStartDaemon } from "./auto-start-deamon";

export const status = async (): Promise<void> => {
    await autoStartDaemon();

    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        client.write("status");
    });
    client.on("data", (data) => {
        console.log(data.toString());
    });
};
