/** Icosaèdre de l'assistant, redessiné d'après plateform_front/src/assets/logo/assistantLogo.png. */
export const FACES = [
    { points: "2,262 400,2 180,477", fill: "#0B7F5C" },
    { points: "400,2 732,392 180,477", fill: "#10A878" },
    { points: "400,2 893,123 732,392", fill: "#12B47E" },
    { points: "893,123 977,673 732,392", fill: "#0E9E72" },
    { points: "732,392 977,673 537,893", fill: "#0B8A62" },
    { points: "180,477 732,392 537,893", fill: "#0C9066" },
    { points: "2,262 180,477 83,812", fill: "#097454" },
    { points: "180,477 537,893 83,812", fill: "#087253" },
    { points: "83,812 537,893 575,933", fill: "#0A7A58" },
    { points: "537,893 977,673 575,933", fill: "#087050" },
];

/** Faces de l'icosaèdre avec leur luminosité relative (0 = face la plus sombre, 1 = la plus claire). */
const green = (hex: string) => parseInt(hex.slice(3, 5), 16);
const [minG, maxG] = [Math.min(...FACES.map((f) => green(f.fill))), Math.max(...FACES.map((f) => green(f.fill)))];
export const ICO_FACES = FACES.map((f) => ({ points: f.points, shade: (green(f.fill) - minG) / (maxG - minG) }));
