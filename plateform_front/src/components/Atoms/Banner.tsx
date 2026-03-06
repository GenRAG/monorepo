import React, { useState } from "react";
import {
    Box,
    Card,
    CardProps,
    HStack,
    Icon,
    StyleProps,
} from "@chakra-ui/react";
import {
    ArrowRight,
    FileWarning,
    Info,
    LeafIcon,
    Lightbulb,
    MessageCircleWarningIcon,
    MessageSquare,
    TriangleAlert,
    X,
} from "lucide-react";

import { useAppResponsive } from "hooks/useAppResponsive";
import borderRadius from "themeNew/foundations/borderRadius";
import colors from "themeNew/foundations/colors";

import Button from "./Button";

export type RamifyBannerProps = {
    variant?: string;
    isCloseable?: boolean;
    children?: React.ReactNode;
    buttonText?: string;
    onClick?: () => void;
} & Omit<CardProps, "title"> &
    StyleProps;

export const StyleBannerVariants: Record<string, any> = {
    gold: {
        icon: Lightbulb,
        bg: "gold.50",
        borderColor: "gold.100",
        glowColor: colors.gold[100],
        iconColor: "gold.700",
        badgeBg: "gold.100",
        _active: {
            bg: "gold.50",
        },
    },
    orange: {
        icon: FileWarning,
        bg: "orange.50",
        borderColor: "orange.100",
        badgeBg: "orange.100",
        iconColor: "orange.700",
        glowColor: colors.orange[100],
        _active: {
            bg: "orange.50",
        },
    },
    blue: {
        icon: Info,
        bg: "blue.50",
        borderColor: "blue.100",
        badgeBg: "blue.100",
        iconColor: "blue.700",
        glowColor: colors.blue[100],
        _active: {
            bg: "blue.50",
        },
    },
    red: {
        icon: TriangleAlert,
        bg: "red.50",
        borderColor: "red.100",
        badgeBg: "red.100",
        glowColor: colors.red[100],
        _active: {
            bg: "red.50",
        },
    },
    green: {
        icon: Info,
        bg: "green.100",
        borderColor: "green.100",
        badgeBg: "green.100",
        iconColor: "green.700",
        glowColor: colors.green[100],
        _active: {
            bg: "green.50",
        },
    },
    grey: {
        icon: MessageSquare,
        bg: "grey.50",
        borderColor: "grey.100",
        badgeBg: "grey.100",
        iconColor: "grey.700",
        glowColor: colors.grey[100],
        _active: {
            bg: "grey.50",
        },
    },
    olive: {
        icon: LeafIcon,
        bg: "olive.50",
        borderColor: "olive.100",
        badgeBg: "olive.100",
        iconColor: "olive.700",
        glowColor: colors.olive[100],
        _active: {
            bg: "olive.50",
        },
    },
    transparent: {
        icon: MessageCircleWarningIcon,
        bg: "transparent",
        borderColor: "transparent",
        badgeBg: "transparent",
        iconColor: "grey.700",
        glowColor: colors.grey[100],
        _active: {
            bg: "grey.50",
        },
    },
};

const Banner = ({
    variant,
    isCloseable,
    children,
    buttonText,
    onClick,
    size = "xs",
    ...props
}: RamifyBannerProps) => {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const [visible, setVisible] = useState(true);

    const isMobile = useAppResponsive({ base: true, md: false });

    const handleCloseBanner = () => {
        setVisible(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <Card
            w="100%"
            hidden={!visible}
            borderRadius={borderRadius.xs}
            cursor={onClick ? "pointer" : "default"}
            shadow="none"
            position="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={handleMouseMove}
            bg={StyleBannerVariants[variant as any].bg || "grey.50"}
            borderWidth="1px"
            borderColor={StyleBannerVariants[variant as any].borderColor}
            _active={
                onClick
                    ? StyleBannerVariants[variant as any]._active
                    : undefined
            }
            onClick={onClick}
            size={size}
            padding="16px"
            {...props}
        >
            {hovered && onClick && (
                <Box
                    pointerEvents="none"
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    bg={`radial-gradient(circle at ${coords.x}px ${coords.y}px, ${
                        StyleBannerVariants[variant as any]?.glowColor
                    }, transparent 50%)`}
                    transition="background 0.3s ease"
                    borderRadius="inherit"
                    zIndex={0}
                />
            )}

            <HStack
                w="100%"
                spacing="12px"
                align="center"
                position="relative"
                zIndex={1}
                flex="4"
            >
                <Icon
                    as={StyleBannerVariants[variant as any]?.icon || Info}
                    boxSize={5}
                    color={
                        StyleBannerVariants[variant as any]?.iconColor ||
                        "grey.700"
                    }
                />
                {children}

                {(buttonText || isCloseable) && (
                    <HStack
                        flex="1"
                        justify="space-between"
                        w="100%"
                        justifyContent="end"
                    >
                        {buttonText && (
                            <Button
                                variant="secondary"
                                icon={ArrowRight}
                                size="sm"
                                btnType={
                                    isMobile
                                        ? "icon"
                                        : buttonText
                                          ? "default"
                                          : "icon"
                                }
                                rightIcon={ArrowRight}
                            >
                                {buttonText}
                            </Button>
                        )}

                        {isCloseable && (
                            <Button
                                variant="link"
                                size="sm"
                                btnType="icon"
                                onClick={handleCloseBanner}
                                icon={X}
                            />
                        )}
                    </HStack>
                )}
            </HStack>
        </Card>
    );
};

export default Banner;
