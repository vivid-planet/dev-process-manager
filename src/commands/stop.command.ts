import { StopCommandOptions } from "../daemon-command/stop.daemon-command";
import { connect } from "./connect";

export const stop = async (options: StopCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`stop ${JSON.stringify(options)}`);
};
