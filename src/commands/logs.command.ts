import { createConnection } from "net";

export const logs = async (name?: string): Promise<void> => {
    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        if (name) {
            client.write(`logs ${name}`);
        } else {
            //all logs
            client.write("logs");
        }
    });
    client.on("data", (data) => {
        //TODO handle stderr/stdin and also write on stderr
        process.stdout.write(data);
    });
};
