import { describe, expect, it } from "vitest";

import { Script } from "./script.js";

function createScript(overrides: Partial<Parameters<(typeof Script)["prototype"]["updateScriptDefinition"]>[0]> = {}) {
    return new Script({
        id: 1,
        name: "test-script",
        script: "echo hello",
        ...overrides,
    });
}

describe("Script", () => {
    describe("aliases", () => {
        it("should return empty array when no alias is set", () => {
            const script = createScript();
            expect(script.aliases).toEqual([]);
        });

        it("should return array with single alias string", () => {
            const script = createScript({ alias: "ts" });
            expect(script.aliases).toEqual(["ts"]);
        });

        it("should return alias array as-is", () => {
            const script = createScript({ alias: ["ts", "tsc"] });
            expect(script.aliases).toEqual(["ts", "tsc"]);
        });
    });

    describe("groups", () => {
        it("should return empty array when no group is set", () => {
            const script = createScript();
            expect(script.groups).toEqual([]);
        });

        it("should return array with single group string", () => {
            const script = createScript({ group: "build" });
            expect(script.groups).toEqual(["build"]);
        });

        it("should return group array as-is", () => {
            const script = createScript({ group: ["build", "dev"] });
            expect(script.groups).toEqual(["build", "dev"]);
        });
    });

    describe("name and id", () => {
        it("should return name from definition", () => {
            const script = createScript({ name: "my-script" });
            expect(script.name).toBe("my-script");
        });

        it("should return id from definition", () => {
            const script = createScript({ id: 42 });
            expect(script.id).toBe(42);
        });
    });

    describe("handleLogs", () => {
        it("should buffer log lines", () => {
            const script = createScript();
            script.handleLogs("line 1\nline 2\n");
            expect(script.logBuffer).toEqual(["line 1", "line 2"]);
        });

        it("should trim old lines when buffer exceeds 100", () => {
            const script = createScript();
            // Fill the buffer with 90 lines
            const first = `${Array.from({ length: 90 }, (_, i) => `old ${i}`).join("\n")}\n`;
            script.handleLogs(first);
            expect(script.logBuffer).toHaveLength(90);

            // Add 20 more lines — should trim to keep 100
            const second = `${Array.from({ length: 20 }, (_, i) => `new ${i}`).join("\n")}\n`;
            script.handleLogs(second);
            expect(script.logBuffer).toHaveLength(100);
            expect(script.logBuffer[0]).toBe("old 10");
            expect(script.logBuffer[99]).toBe("new 19");
        });
    });
});
