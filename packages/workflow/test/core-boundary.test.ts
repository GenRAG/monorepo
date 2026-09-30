import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";

// `@genrag/workflow/core` must stay usable without the UI stack (a Node service, another front...).
const FORBIDDEN = ["react", "react-dom", "@chakra-ui/react", "@xyflow/react", "framer-motion", "lucide-react"];

/** Runtime `require()` specifiers reachable from a compiled module, following relative paths. */
function reachableRequires(entry: string): Set<string> {
    const external = new Set<string>();
    const seen = new Set<string>();
    const queue = [entry];
    while (queue.length > 0) {
        const file = queue.pop()!;
        if (seen.has(file)) continue;
        seen.add(file);
        for (const [, specifier] of readFileSync(file, "utf8").matchAll(/require\("([^"]+)"\)/g)) {
            if (specifier.endsWith(".css")) {
                external.add(specifier);
            } else if (specifier.startsWith(".")) {
                const target = resolve(dirname(file), specifier);
                queue.push(existsSync(`${target}.js`) ? `${target}.js` : resolve(target, "index.js"));
            } else {
                external.add(specifier);
            }
        }
    }
    return external;
}

describe("core entry", () => {
    it("does not load React, Chakra, ReactFlow, icons or CSS at runtime", () => {
        const requires = reachableRequires(resolve(__dirname, "../src/core.js"));

        const leaks = [...requires].filter(
            (s) => s.endsWith(".css") || FORBIDDEN.some((f) => s === f || s.startsWith(`${f}/`)),
        );
        assert.deepEqual(leaks, []);
        assert.ok(requires.has("uuid"));
    });
});
