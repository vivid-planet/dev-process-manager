import CLITable from "cli-table3";
import colors from "colors";
import { create as createLogUpdate } from "log-update";

import { type ScriptStatusEntry, type StatusCommandOptions } from "../daemon-command/status.daemon-command.js";
import { type ScriptStatus } from "../daemon-command/script.js";
import { connect } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

const statusTexts: { [status in ScriptStatus]: string } = {
    started: colors.green("Running"),
    stopping: colors.red("Stopping"),
    stopped: "Stopped",
    waiting: colors.yellow("Waiting"),
    backoff: colors.red("Backoff"),
};

function renderTable(entries: ScriptStatusEntry[]): string {
    const table = new CLITable({
        head: [
            colors.blue.bold("ID"),
            colors.blue.bold("Script"),
            colors.blue.bold("Status"),
            colors.blue.bold("CPU"),
            colors.blue.bold("Mem"),
            colors.bold.blue("PID"),
            colors.bold.blue("Restarts"),
        ],
        style: { compact: true },
    });
    for (const entry of entries) {
        table.push([
            entry.id,
            entry.name,
            statusTexts[entry.status],
            entry.cpu,
            entry.memory,
            entry.pid?.toString(),
            entry.restarts,
        ]);
    }
    return table.toString();
}

export const status = async (options: StatusCommandOptions): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();

    const logUpdate = options.interval ? createLogUpdate(process.stdout) : undefined;
    let buffer = "";

    client.on("data", (data: Buffer) => {
        buffer += data.toString();
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            const line = buffer.substring(0, newlineIndex);
            buffer = buffer.substring(newlineIndex + 1);

            const parsed = JSON.parse(line);
            if (parsed.error) {
                console.log(parsed.error);
                return;
            }

            const output = renderTable(parsed as ScriptStatusEntry[]);
            if (logUpdate) {
                logUpdate(output);
            } else {
                console.log(output);
            }
        }
    });

    client.write(`status ${JSON.stringify(options)}`);
};
