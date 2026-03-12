import { execSync, spawn } from "child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const devPmBin = resolve(projectRoot, "lib/dev-pm.js");

function stripAnsi(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function runDevPm(args: string[], cwd: string, timeoutMs = 1000): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [devPmBin, ...args], { cwd });
        let output = "";
        child.stdout?.on("data", (d: Buffer) => (output += d.toString()));
        child.stderr?.on("data", (d: Buffer) => (output += d.toString()));
        const timer = setTimeout(() => {
            child.kill();
            reject(new Error(`dev-pm ${args.join(" ")} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        child.on("close", () => {
            clearTimeout(timer);
            resolve(output);
        });
        child.on("error", (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

describe("dev-pm e2e", () => {
    let tmpDir: string;

    beforeEach(() => {
        execSync("npm run build", { cwd: projectRoot, stdio: "pipe" });

        tmpDir = resolve(tmpdir(), "dev-pm-e2e-test");
        if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
        mkdirSync(tmpDir, { recursive: true });

        writeFileSync(
            resolve(tmpDir, "dev-pm.config.mjs"),
            `export default {
    scripts: [
        { name: "test-script", script: 'node -e "setInterval(() => {}, 1000)"' },
    ],
};
`,
        );
    }, 30000);

    afterEach(async () => {
        try {
            await runDevPm(["shutdown"], tmpDir);
        } catch {
            // daemon may already be down
        }
        await new Promise((r) => setTimeout(r, 500));
        if (tmpDir && existsSync(tmpDir)) {
            rmSync(tmpDir, { recursive: true, force: true });
        }
    }, 15000);

    it("full lifecycle: status → start → status → shutdown", async () => {
        // Status auto-starts daemon — script should be stopped
        const status1 = stripAnsi(await runDevPm(["status"], tmpDir));
        expect(status1).toContain("test-script");
        expect(status1).toContain("Stopped");

        // Start the script
        const startOutput = await runDevPm(["start", "test-script"], tmpDir);
        expect(startOutput).toContain("starting test-script");

        // Give process time to start
        await new Promise((r) => setTimeout(r, 100));

        // Status should now show running
        const status2 = stripAnsi(await runDevPm(["status"], tmpDir));
        expect(status2).toContain("test-script");
        expect(status2).toContain("Running");

        // Shutdown the daemon
        await runDevPm(["shutdown"], tmpDir);

        // Socket file should be cleaned up
        await new Promise((r) => setTimeout(r, 100));
        expect(existsSync(resolve(tmpDir, ".pm.sock"))).toBe(false);
    }, 30000);

    it("loads .env and .env.local for waitOn variable expansion", async () => {
        // .env sets TEST_PORT=19876
        writeFileSync(resolve(tmpDir, ".env"), "TEST_PORT=19876\n");
        // .env.local overrides to 19877
        writeFileSync(resolve(tmpDir, ".env.local"), "TEST_PORT=19877\n");

        // Rewrite config with a waitOn that references $TEST_PORT
        writeFileSync(
            resolve(tmpDir, "dev-pm.config.mjs"),
            `export default {
    scripts: [
        { name: "test-script", script: 'node -e "setInterval(() => {}, 1000)"', waitOn: "tcp:$TEST_PORT" },
    ],
};
`,
        );

        // Start the script — it will enter "waiting" state since nothing listens on that port
        await runDevPm(["start", "test-script"], tmpDir);
        await new Promise((r) => setTimeout(r, 2000));

        const status1 = stripAnsi(await runDevPm(["status"], tmpDir));
        expect(status1).toContain("test-script");
        expect(status1).toContain("Waiting");

        // Check logs — should show the expanded port from .env.local (19877), not .env (19876)
        const logs = stripAnsi(await runDevPm(["logs", "-n", "10", "test-script"], tmpDir));
        expect(logs).toContain("19877");
        expect(logs).not.toContain("19876");
    }, 30000);

    it("works from a subdirectory of the config file", async () => {
        const subDir = resolve(tmpDir, "packages", "app");
        mkdirSync(subDir, { recursive: true });

        // Status auto-starts daemon from subfolder — config is found by walking up
        const status1 = stripAnsi(await runDevPm(["status"], subDir));
        expect(status1).toContain("test-script");
        expect(status1).toContain("Stopped");

        // Start the script from subfolder
        const startOutput = await runDevPm(["start", "test-script"], subDir);
        expect(startOutput).toContain("starting test-script");

        await new Promise((r) => setTimeout(r, 100));

        // Status from subfolder should show running
        const status2 = stripAnsi(await runDevPm(["status"], subDir));
        expect(status2).toContain("test-script");
        expect(status2).toContain("Running");

        // Shutdown from subfolder
        await runDevPm(["shutdown"], subDir);

        await new Promise((r) => setTimeout(r, 100));
        expect(existsSync(resolve(tmpDir, ".pm.sock"))).toBe(false);
    }, 30000);
});
