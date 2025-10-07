import { LogsCommandOptions } from "../daemon-command/logs.daemon-command.js";
import { connect } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

export const logs = async (options: LogsCommandOptions): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();
    client.write(`logs ${JSON.stringify(options)}`);
};
