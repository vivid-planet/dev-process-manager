import { LogsCommandOptions } from "../daemon-command/logs.daemon-command.js";
import { connect } from "./connect.js";

export const logs = async (options: LogsCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`logs ${JSON.stringify(options)}`);
};
