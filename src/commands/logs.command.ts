import { LogsCommandOptions } from "../daemon-command/logs.daemon-command";
import { connect } from "./connect";

export const logs = async (options: LogsCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`logs ${JSON.stringify(options)}`);
};
