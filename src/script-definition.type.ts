export interface ScriptDefinition {
    id: number;
    name: string;
    script: string;
    group?: string | string[];
    waitOn?: string | string[];
    env?: NodeJS.ProcessEnv;
}
