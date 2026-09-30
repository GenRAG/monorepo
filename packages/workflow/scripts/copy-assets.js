// tsc only emits .js/.d.ts: copy the stylesheets imported by the components next to their compiled module,
// otherwise `require("./edge-animations.css")` fails for any consumer of dist/.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src");
const dist = path.join(__dirname, "..", "dist");

function copyCss(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const from = path.join(dir, entry.name);
        if (entry.isDirectory()) copyCss(from);
        else if (entry.name.endsWith(".css")) {
            const to = path.join(dist, path.relative(src, from));
            fs.mkdirSync(path.dirname(to), { recursive: true });
            fs.copyFileSync(from, to);
        }
    }
}

copyCss(src);
