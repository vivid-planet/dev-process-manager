export interface ScriptDefinition {
    name: string;
    script: string;
    group?: string | string[];
    waitOn?: string | string[];
}
