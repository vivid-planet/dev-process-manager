import { StopCommandOptions } from "../daemon-command/stop.daemon-command.js";
import { connect } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

export const stop = async (options: StopCommandOptions): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();
    client.write(`stop ${JSON.stringify(options)}`);
};
