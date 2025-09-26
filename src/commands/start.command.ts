import { StartCommandOptions } from "../daemon-command/start.daemon-command.js";
import { connect } from "./connect.js";

export const start = async (options: StartCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`start ${JSON.stringify(options)}`);
};
