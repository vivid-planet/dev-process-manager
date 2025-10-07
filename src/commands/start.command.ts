import { StartCommandOptions } from "../daemon-command/start.daemon-command.js";
import { connect } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

export const start = async (options: StartCommandOptions): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();
    client.write(`start ${JSON.stringify(options)}`);
};
