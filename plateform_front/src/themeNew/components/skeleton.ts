import { defineStyleConfig } from "@chakra-ui/react";

const Skeleton = defineStyleConfig({
    baseStyle: {
        "--skeleton-start-color": "var(--chakra-colors-grey-100)",
        "--skeleton-end-color": "var(--chakra-colors-grey-200)",
        _dark: {
            "--skeleton-start-color": "var(--chakra-colors-grey-800)",
            "--skeleton-end-color": "var(--chakra-colors-grey-700)",
        },
    },
});

export default Skeleton;
