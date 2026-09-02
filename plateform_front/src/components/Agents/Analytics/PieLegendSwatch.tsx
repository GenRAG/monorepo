import { Box, type BoxProps } from "@chakra-ui/react";

interface PieLegendSwatchProps extends BoxProps {
    color: string;
    /** Mirrors the diagonal PatternLines fill used on the corresponding pie slice. */
    patterned?: boolean;
}

export const PieLegendSwatch = ({ color, patterned = false, ...rest }: PieLegendSwatchProps) => (
    <Box
        w={5}
        h={5}
        borderRadius="4px"
        flexShrink={0}
        bg={patterned ? "transparent" : color}
        bgImage={
            patterned
                ? `repeating-linear-gradient(45deg, ${color}, ${color} 1.5px, transparent 1.5px, transparent 5px)`
                : undefined
        }
        borderWidth={patterned ? "1px" : 0}
        borderStyle="solid"
        borderColor={patterned ? color : "transparent"}
        {...rest}
    />
);
