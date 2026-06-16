import { type RestartCommandOptions } from "../daemon-command/restart.daemon-command.js";
import { connect, pipeToStdout } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

export const restart = async (options: RestartCommandOptions): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();
    pipeToStdout(client);
    client.write(`restart ${JSON.stringify(options)}`);
};
