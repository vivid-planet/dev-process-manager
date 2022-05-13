import { createConnection } from "net";

export const shutdown = async (): Promise<void> => {
    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        client.write("shutdown");
    });
};
