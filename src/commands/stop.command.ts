import { type StopCommandOptions } from "../daemon-command/stop.daemon-command.js";
import { connect, pipeToStdout } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

export const stop = async (options: StopCommandOptions): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();
    pipeToStdout(client);
    client.write(`stop ${JSON.stringify(options)}`);
};
