import { Box, Icon, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import { useAppResponsive } from "hooks/useAppResponsive";

export enum ShapeType {
    CIRCLE = "circle",
    SQUARE = "square",
    DIAMOND = "diamond",
    HEXAGON = "hexagon",
    OCTAGON = "octagon",
    PENTAGON = "pentagon",
    STAR = "star",
    TRIANGLE = "triangle",
}

interface NodeShapeProps {
    shape: ShapeType | string;
    icon: any;
    isSelected: boolean;
    size?: number;
    backgroundColor?: { light: string; dark: string };
    borderColor?: { light: string; dark: string };
    canHover?: boolean;
    iconSize?: number;
}

const SHAPE_CONFIGS: Record<string, Record<string, string>> = {
    [ShapeType.CIRCLE]: {
        borderRadius: "50%",
    },
    [ShapeType.SQUARE]: {
        borderRadius: "8px",
    },
    [ShapeType.DIAMOND]: {
        transform: "rotate(45deg)",
        borderRadius: "8px",
    },
    [ShapeType.HEXAGON]: {
        clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
    },
    [ShapeType.OCTAGON]: {
        clipPath:
            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
    },
    [ShapeType.PENTAGON]: {
        clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
    },
    [ShapeType.STAR]: {
        clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    },
    [ShapeType.TRIANGLE]: {
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
    },
};

export const NodeShape = ({
    shape,
    icon,
    isSelected,
    size = 80,
    iconSize = 32,
    backgroundColor = { light: "#FFFFFF", dark: "grey.700" },
    borderColor = { light: "#34D3A9", dark: "#34D3A9" },
    canHover = true,
}: NodeShapeProps) => {
    const [isHovered, setIsHovered] = useState(false);

    useAppResponsive({ base: true, lg: false });

    const borderColorValue = useColorModeValue(
        borderColor.light,
        borderColor.dark,
    );
    const hoverBackgroundColor = useColorModeValue("#F7FAFC", "#2F855A");
    const backgroundColorValue = useColorModeValue(
        backgroundColor.light,
        backgroundColor.dark,
    );
    const selectedBackgroundColor = useColorModeValue("#F0FFF4", "#2F855A");

    const shapeConfig = SHAPE_CONFIGS[shape] ?? SHAPE_CONFIGS[ShapeType.SQUARE];
    const isDiamond = shape === ShapeType.DIAMOND;
    const borderWidth = 1;

    return (
        <Box
            position="relative"
            w={`${size}px`}
            h={`${size}px`}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Box
                position="absolute"
                w={`${size}px`}
                h={`${size}px`}
                bg={isSelected ? "#34D3A9" : borderColorValue}
                {...shapeConfig}
            />
            <Box
                position="absolute"
                w={`${size - borderWidth * 2}px`}
                h={`${size - borderWidth * 2}px`}
                bg={
                    isHovered && canHover
                        ? hoverBackgroundColor
                        : isSelected
                          ? selectedBackgroundColor
                          : backgroundColorValue
                }
                transition="all 0.2s"
                _hover={canHover ? { cursor: "pointer" } : undefined}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                {...shapeConfig}
            />
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform={
                    isDiamond
                        ? "translate(-50%, -50%) rotate(-45deg)"
                        : "translate(-50%, -50%)"
                }
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                pointerEvents="none"
                zIndex={1}
            >
                <Icon as={icon} size={iconSize} boxSize={iconSize} />
            </Box>
        </Box>
    );
};
