import React, { useState } from "react";
import {
    Box,
    Card,
    CardProps,
    HStack,
    Icon,
    StyleProps,
    Text,
    useColorMode,
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

export type GenragBannerProps = {
    variant?: string;
    isCloseable?: boolean;
    children?: React.ReactNode;
    buttonText?: string;
    onClick?: () => void;
    title?: string;
    image?: string;
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
        _active: { bg: "gold.50" },
        _dark: {
            bg: "gold.900",
            borderColor: "gold.800",
            badgeBg: "gold.800",
            iconColor: "gold.300",
        },
    },
    orange: {
        icon: FileWarning,
        bg: "orange.50",
        borderColor: "orange.100",
        badgeBg: "orange.100",
        iconColor: "orange.700",
        glowColor: colors.orange[100],
        _active: { bg: "orange.50" },
        _dark: {
            bg: "orange.900",
            borderColor: "orange.800",
            badgeBg: "orange.800",
            iconColor: "orange.300",
        },
    },
    blue: {
        icon: Info,
        bg: "blue.50",
        borderColor: "blue.100",
        badgeBg: "blue.100",
        iconColor: "blue.700",
        glowColor: colors.blue[100],
        _active: { bg: "blue.50" },
        _dark: {
            bg: "blue.900",
            borderColor: "blue.800",
            badgeBg: "blue.800",
            iconColor: "blue.300",
        },
    },
    red: {
        icon: TriangleAlert,
        bg: "red.50",
        borderColor: "red.100",
        badgeBg: "red.100",
        iconColor: "red.700",
        glowColor: colors.red[100],
        _active: { bg: "red.50" },
        _dark: {
            bg: "red.900",
            borderColor: "red.800",
            badgeBg: "red.800",
            iconColor: "red.300",
        },
    },
    green: {
        icon: Info,
        bg: "green.100",
        borderColor: "green.100",
        badgeBg: "green.200",
        iconColor: "green.700",
        glowColor: colors.green[100],
        _active: { bg: "green.50" },
        _dark: {
            bg: "green.900",
            borderColor: "green.800",
            badgeBg: "green.800",
            iconColor: "green.300",
        },
    },
    grey: {
        icon: MessageSquare,
        bg: "grey.50",
        borderColor: "grey.100",
        badgeBg: "grey.100",
        iconColor: "grey.700",
        glowColor: colors.grey[100],
        _active: { bg: "grey.50" },
        _dark: {
            bg: "grey.800",
            borderColor: "grey.700",
            badgeBg: "grey.700",
            iconColor: "grey.300",
        },
    },
    olive: {
        icon: LeafIcon,
        bg: "olive.50",
        borderColor: "olive.100",
        badgeBg: "olive.100",
        iconColor: "olive.700",
        glowColor: colors.olive[100],
        _active: { bg: "olive.50" },
        _dark: {
            bg: "olive.900",
            borderColor: "olive.800",
            badgeBg: "olive.800",
            iconColor: "olive.300",
        },
    },
    transparent: {
        icon: MessageCircleWarningIcon,
        bg: "transparent",
        borderColor: "transparent",
        badgeBg: "transparent",
        iconColor: "grey.700",
        glowColor: colors.grey[100],
        _active: { bg: "grey.50" },
        _dark: {
            bg: "transparent",
            borderColor: "transparent",
            badgeBg: "grey.800",
            iconColor: "grey.300",
        },
    },
    dark: {
        icon: Info,
        bg: "grey.900",
        borderColor: "grey.800",
        badgeBg: "grey.800",
        iconColor: "grey.300",
        glowColor: "rgba(255,255,255,0.05)",
        _active: { bg: "grey.800" },
        _dark: {
            bg: "grey.900",
            borderColor: "grey.800",
            badgeBg: "grey.700",
            iconColor: "grey.300",
        },
    },
};

const Banner = ({
    variant = "grey",
    isCloseable,
    children,
    buttonText,
    onClick,
    title,
    image,
    size = "xs",
    ...props
}: GenragBannerProps) => {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const [visible, setVisible] = useState(true);

    const isMobile = useAppResponsive({ base: true, md: false });
    const { colorMode } = useColorMode();

    const isVariantDark = variant === "dark";
    const isDarkMode = colorMode === "dark";

    const handleCloseBanner = () => setVisible(false);
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const baseStyle = StyleBannerVariants[variant] ?? StyleBannerVariants.grey;
    const variantStyle = {
        ...baseStyle,
        ...(isDarkMode ? (baseStyle._dark ?? {}) : {}),
    };

    return (
        <Card
            w="100%"
            hidden={!visible}
            borderRadius={isVariantDark ? "16px" : borderRadius.xs}
            cursor={onClick ? "pointer" : "default"}
            shadow={isVariantDark ? "0 8px 32px rgba(0,0,0,0.4)" : "none"}
            position="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={handleMouseMove}
            bg={variantStyle.bg}
            borderWidth="1px"
            borderColor={variantStyle.borderColor}
            _active={onClick ? variantStyle._active : undefined}
            onClick={onClick}
            size={size}
            padding="12px 14px"
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
                    bg={`radial-gradient(circle at ${coords.x}px ${coords.y}px, ${variantStyle.glowColor}, transparent 50%)`}
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
            >
                <Box
                    flexShrink={0}
                    w="40px"
                    h="40px"
                    borderRadius="10px"
                    overflow="hidden"
                    bg={variantStyle.badgeBg}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    {image ? (
                        <Box
                            as="img"
                            src={image}
                            alt=""
                            w="100%"
                            h="100%"
                            objectFit="cover"
                        />
                    ) : (
                        <Icon
                            as={variantStyle.icon || Info}
                            boxSize={5}
                            color={variantStyle.iconColor || "grey.700"}
                        />
                    )}
                </Box>

                <Box flex="1" minW={0}>
                    {title && (
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                isVariantDark || isDarkMode
                                    ? "white"
                                    : "textPrimary"
                            }
                            noOfLines={1}
                            mb={children ? "2px" : 0}
                        >
                            {title}
                        </Text>
                    )}
                    {children && (
                        <Box
                            fontSize="sm"
                            color={
                                isVariantDark || isDarkMode
                                    ? "whiteAlpha.700"
                                    : "textSecondary"
                            }
                            lineHeight="1.4"
                        >
                            {children}
                        </Box>
                    )}
                </Box>

                {(buttonText || isCloseable) && (
                    <HStack spacing={2} flexShrink={0}>
                        {buttonText && (
                            <Button
                                variant={isVariantDark ? "ghost" : "secondary"}
                                icon={ArrowRight}
                                size="sm"
                                btnType={isMobile ? "icon" : "default"}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseBanner();
                                }}
                                icon={X}
                                color={
                                    isVariantDark || isDarkMode
                                        ? "grey.400"
                                        : undefined
                                }
                            />
                        )}
                    </HStack>
                )}
            </HStack>
        </Card>
    );
};

export default Banner;
