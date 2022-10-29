import { StartCommandOptions } from "../daemon-command/start.deamon-command";
import { connect } from "./connect";

export const start = async (options: StartCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`start ${JSON.stringify(options)}`);
};
