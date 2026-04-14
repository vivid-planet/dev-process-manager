import { createConnection, type Socket } from "net";

/**
 * Parsed script status entry from the daemon's JSON response.
 */
export interface ScriptStatusEntry {
    id: number;
    name: string;
    status: string;
    cpu: string;
    memory: string;
    pid: number | undefined;
    restarts: number;
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
 * Parse the daemon's JSON status response into structured data.
 */
export function parseStatusOutput(output: string): ScriptStatusEntry[] {
    const line = output.trim();
    if (!line) return [];
    const parsed = JSON.parse(line);
    if (parsed.error) return [];
    return parsed as ScriptStatusEntry[];
}

/**
 * Strip ANSI escape sequences from a string.
 */
export function stripAnsi(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1B\[[\?]?[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Query the daemon's version. Returns undefined if the daemon doesn't support the version command (old daemon).
 */
export async function getDaemonVersion(socketPath: string): Promise<string | undefined> {
    try {
        const output = await sendCommand(socketPath, "version");
        const line = output.trim();
        if (!line) return undefined;
        const parsed = JSON.parse(line);
        return parsed.version;
    } catch {
        return undefined;
    }
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
