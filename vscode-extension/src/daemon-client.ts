import { createConnection, type Socket } from "net";

/**
 * Parsed script status entry from the daemon's status table output.
 */
export interface ScriptStatusEntry {
    id: number;
    name: string;
    status: string;
    cpu: string;
    memory: string;
    pid: string;
    restarts: string;
}

/**
 * Send a command to the dev-pm daemon over the Unix socket and collect the full response.
 */
export function sendCommand(socketPath: string, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const client = createConnection(socketPath);

        const timeout = setTimeout(() => {
            client.destroy();
            reject(new Error("Connection timed out"));
        }, 10000);

        client.on("connect", () => {
            client.write(command);
        });

        client.on("data", (data: Buffer) => {
            chunks.push(data);
        });

        client.on("end", () => {
            clearTimeout(timeout);
            resolve(Buffer.concat(chunks).toString());
        });

        client.on("error", (err: NodeJS.ErrnoException) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

/**
 * Send a command to the daemon, streaming data to a callback until the socket closes.
 * Returns a dispose function to close the connection early.
 */
export function sendCommandStreaming(
    socketPath: string,
    command: string,
    onData: (data: string) => void,
    onEnd?: () => void,
    onError?: (err: Error) => void,
): { socket: Socket; dispose: () => void } {
    const client = createConnection(socketPath);

    client.on("connect", () => {
        client.write(command);
    });

    client.on("data", (data: Buffer) => {
        onData(data.toString());
    });

    client.on("end", () => {
        onEnd?.();
    });

    client.on("error", (err: NodeJS.ErrnoException) => {
        onError?.(err);
    });

    return {
        socket: client,
        dispose: () => {
            client.destroy();
        },
    };
}

/**
 * Parse the ANSI-decorated CLI table output from the status command into structured data.
 * The daemon sends a cli-table3 formatted table with ANSI color codes.
 */
export function parseStatusOutput(output: string): ScriptStatusEntry[] {
    const entries: ScriptStatusEntry[] = [];

    // Strip ANSI escape codes for parsing
    const clean = stripAnsi(output);

    // The table uses box-drawing characters (│) as column separators
    const lines = clean.split("\n");

    for (const line of lines) {
        // Match table data rows: lines that start and end with │
        if (!line.includes("│")) {
            continue;
        }

        const cells = line
            .split("│")
            .map((c) => c.trim())
            .filter((c) => c !== "");

        if (cells.length < 7) {
            continue;
        }

        // Skip the header row
        const id = parseInt(cells[0], 10);
        if (isNaN(id)) {
            continue;
        }

        entries.push({
            id,
            name: cells[1],
            status: cells[2].toLowerCase(),
            cpu: cells[3],
            memory: cells[4],
            pid: cells[5],
            restarts: cells[6],
        });
    }

    return entries;
}

/**
 * Strip ANSI escape sequences from a string.
 */
export function stripAnsi(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1B\[[\?]?[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Check if the daemon socket file exists and is connectable.
 */
export function isDaemonRunning(socketPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const client = createConnection(socketPath);

        const timeout = setTimeout(() => {
            client.destroy();
            resolve(false);
        }, 3000);

        client.on("connect", () => {
            clearTimeout(timeout);
            client.destroy();
            resolve(true);
        });

        client.on("error", () => {
            clearTimeout(timeout);
            client.destroy();
            resolve(false);
        });
    });
}
