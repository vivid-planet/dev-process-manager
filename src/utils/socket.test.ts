import { mkdirSync, rmSync } from "fs";
import { createConnection, createServer, type Server, type Socket } from "net";
import { tmpdir } from "os";
import { resolve } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { connectToSocket, getSocketPath, listenOnSocket, SOCKET_FILE_NAME } from "./socket.js";

function waitForConnection(socket: Socket): Promise<void> {
    return new Promise((res, rej) => {
        socket.on("connect", res);
        socket.on("error", rej);
    });
}

function closeServer(server: Server): Promise<void> {
    return new Promise((res) => server.close(() => res()));
}

describe("socket", () => {
    let baseDir: string;
    let longDir: string;
    let shortDir: string;

    beforeEach(() => {
        baseDir = resolve(tmpdir(), "dev-pm-socket-test");
        rmSync(baseDir, { recursive: true, force: true });
        // sockaddr_un.sun_path is 108 bytes on Linux and 104 bytes on macOS, so nest deep enough to exceed both
        longDir = resolve(baseDir, "a".repeat(60), "b".repeat(60));
        shortDir = resolve(baseDir, "short");
        mkdirSync(longDir, { recursive: true });
        mkdirSync(shortDir, { recursive: true });
    });

    afterEach(() => {
        rmSync(baseDir, { recursive: true, force: true });
    });

    it("builds the socket path next to the config file", () => {
        expect(getSocketPath(resolve(shortDir, "dev-pm.config.mjs"))).toBe(resolve(shortDir, SOCKET_FILE_NAME));
    });

    it("listens and connects on a short path", async () => {
        const socketPath = getSocketPath(resolve(shortDir, "dev-pm.config.mjs"));
        const server = createServer();
        listenOnSocket(server, socketPath);

        const client = connectToSocket(socketPath);
        await expect(waitForConnection(client)).resolves.toBeUndefined();

        client.destroy();
        await closeServer(server);
    });

    it("listens and connects on a path that is too long for sockaddr_un", async () => {
        const socketPath = getSocketPath(resolve(longDir, "dev-pm.config.mjs"));
        expect(socketPath.length).toBeGreaterThan(108);
        const cwdBefore = process.cwd();

        const server = createServer();
        listenOnSocket(server, socketPath);
        expect(process.cwd()).toBe(cwdBefore);

        const client = connectToSocket(socketPath);
        await expect(waitForConnection(client)).resolves.toBeUndefined();
        expect(process.cwd()).toBe(cwdBefore);

        // without the workaround the very same path cannot be connected to
        await expect(waitForConnection(createConnection(socketPath))).rejects.toMatchObject({
            code: expect.stringMatching(/^(EINVAL|ENOENT)$/),
        });

        client.destroy();
        await closeServer(server);
    });
});
