import { type LogsCommandOptions } from "../daemon-command/logs.daemon-command.js";
import { connect, pipeToStdout } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

export const logs = async (options: LogsCommandOptions): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();
    pipeToStdout(client);
    client.write(`logs ${JSON.stringify(options)}`);
};
