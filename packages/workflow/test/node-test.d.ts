// Minimal typings for the Node built-ins used by the tests, so the package needs no @types/node.
declare module "node:test" {
    export function describe(name: string, fn: () => void): void;
    export function it(name: string, fn: () => void | Promise<void>): void;
}

declare module "node:assert/strict" {
    interface Assert {
        (value: unknown, message?: string): asserts value;
        ok(value: unknown, message?: string): asserts value;
        equal(actual: unknown, expected: unknown, message?: string): void;
        notEqual(actual: unknown, expected: unknown, message?: string): void;
        deepEqual(actual: unknown, expected: unknown, message?: string): void;
        throws(fn: () => unknown, expected?: RegExp | object, message?: string): void;
    }
    const assert: Assert;
    export default assert;
}

declare module "node:fs" {
    export function readFileSync(path: string, encoding: "utf8"): string;
    export function existsSync(path: string): boolean;
}

declare module "node:path" {
    export function dirname(path: string): string;
    export function join(...paths: string[]): string;
    export function resolve(...paths: string[]): string;
}

declare const __dirname: string;
