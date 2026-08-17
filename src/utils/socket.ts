import { createConnection, type Server, type Socket } from "net";
import { basename, dirname, join } from "path";

export const SOCKET_FILE_NAME = ".pm.sock";

export function getSocketPath(configSource: string): string {
    return join(dirname(configSource), SOCKET_FILE_NAME);
}

// Unix domain socket paths must fit into sockaddr_un.sun_path, which is 108 bytes on Linux and 104 bytes on macOS.
// Binding or connecting to a longer path fails with EINVAL (or ENOENT, if the path gets truncated).
// Only the string passed to bind()/connect() counts, so we work around the limit by using the socket file name
// relative to a cwd that points at the directory containing the socket.
const MAX_SOCKET_PATH_LENGTH = 100;

function socketPathFitsIntoSunPath(socketPath: string): boolean {
    return Buffer.byteLength(socketPath) <= MAX_SOCKET_PATH_LENGTH;
}

// net.createConnection() and server.listen() pass the path to the OS synchronously, so it is safe to restore the cwd right after.
function inDirectory<T>(directory: string, callback: () => T): T {
    const previousCwd = process.cwd();
    process.chdir(directory);
    try {
        return callback();
    } finally {
        process.chdir(previousCwd);
    }
}

export function connectToSocket(socketPath: string): Socket {
    if (socketPathFitsIntoSunPath(socketPath)) {
        return createConnection(socketPath);
    }
    return inDirectory(dirname(socketPath), () => createConnection(basename(socketPath)));
}

export function listenOnSocket(server: Server, socketPath: string): void {
    if (socketPathFitsIntoSunPath(socketPath)) {
        server.listen(socketPath);
        return;
    }
    inDirectory(dirname(socketPath), () => server.listen(basename(socketPath)));
}
