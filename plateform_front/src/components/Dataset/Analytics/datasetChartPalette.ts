import { useColorModeValue } from "@chakra-ui/react";

// Categorical slots, brand green first. Validated (lightness band, chroma, CVD and normal-vision separation,
// 3:1 contrast) against white in light mode and grey.950 in dark mode: change them only after re-validating.
const LIGHT = ["#07966F", "#7C5CE0", "#D9622B", "#2F6FD6"] as const;
const DARK = ["#0FA67D", "#9373F5", "#D06A38", "#4A8DF0"] as const;

export const useDatasetChartPalette = (): readonly string[] => useColorModeValue(LIGHT, DARK);

export type FileTypeGroup = "PDF" | "Word" | "Markdown" | "Texte";

/** Fixed order: a file type keeps its color whatever the dataset holds. */
export const FILE_TYPE_GROUPS: FileTypeGroup[] = ["PDF", "Word", "Markdown", "Texte"];

export const getFileTypeGroup = (mimeType: string): FileTypeGroup => {
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("word") || mimeType.includes("officedocument")) return "Word";
    if (mimeType.includes("markdown")) return "Markdown";
    return "Texte";
};
