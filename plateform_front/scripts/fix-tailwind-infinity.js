// Tailwind v4's `rounded-full` emits `border-radius: calc(infinity * 1px)`.
// The CRA production build's CSS minifier (postcss-calc via cssnano) can't parse the
// `infinity` keyword in calc() and fails the build with a lexical error. Since this
// utility is only ever meant to produce a fully-rounded corner, swapping it for a
// plain large px value is visually identical and sidesteps the minifier bug.
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "src", "tailwind.generated.css");
const css = fs.readFileSync(file, "utf8");
const fixed = css.replace(/calc\(infinity\s*\*\s*1px\)/g, "9999px");

if (fixed !== css) {
    fs.writeFileSync(file, fixed);
}
