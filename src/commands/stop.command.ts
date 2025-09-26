import { StopCommandOptions } from "../daemon-command/stop.daemon-command.js";
import { connect } from "./connect.js";

export const stop = async (options: StopCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`stop ${JSON.stringify(options)}`);
};
