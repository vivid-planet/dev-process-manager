import { createConnection } from "net";

export const shutdown = async (): Promise<void> => {
    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        client.write("shutdown");
    });
    client.on("data", (data) => {
        //TODO handle stderr/stdin and also write on stderr
        process.stdout.write(data);
    });
};
