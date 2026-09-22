import React, { useState } from "react";
import { Box, Card, CardProps, HStack, Icon, StyleProps, Text, useColorMode } from "@chakra-ui/react";
import { ArrowRight, Info, X } from "lucide-react";

import { useAppResponsive } from "hooks/useAppResponsive";
import borderRadius from "themeNew/foundations/borderRadius";
import { BannerSizeKey, BannerVariantKey, SizeBannerVariants, StyleBannerVariants } from "components/ui/bannerVariants";

import Button from "./Button";

export type { BannerSizeKey, BannerVariantKey } from "components/ui/bannerVariants";
export { SizeBannerVariants, StyleBannerVariants } from "components/ui/bannerVariants";

export type GenragBannerProps = {
    variant?: BannerVariantKey;
    size?: BannerSizeKey;
    isCloseable?: boolean;
    children?: React.ReactNode;
    buttonText?: string;
    onClick?: () => void;
    title?: string;
    image?: string;
} & Omit<CardProps, "title" | "variant" | "size"> &
    StyleProps;

const Banner = ({
    variant = "grey",
    isCloseable,
    children,
    buttonText,
    onClick,
    title,
    image,
    size = "md",
    ...props
}: GenragBannerProps) => {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const [visible, setVisible] = useState(true);

    const isMobile = useAppResponsive({ base: true, md: false });
    const { colorMode } = useColorMode();

    const isVariantDark = variant === "dark";
    const isDarkMode = colorMode === "dark";

    const sizeStyle = SizeBannerVariants[size] ?? SizeBannerVariants.md;
    const baseStyle = StyleBannerVariants[variant] ?? StyleBannerVariants.grey;
    const variantStyle = {
        ...baseStyle,
        ...(isDarkMode ? (baseStyle._dark ?? {}) : {}),
    };

    const handleCloseBanner = () => setVisible(false);
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <Card
            w="100%"
            hidden={!visible}
            borderRadius={isVariantDark ? "16px" : borderRadius.sm}
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
            padding={sizeStyle.padding}
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

            <HStack w="100%" spacing={sizeStyle.spacing} align="center" position="relative" zIndex={1}>
                <Box
                    flexShrink={0}
                    w={sizeStyle.iconBoxSize}
                    h={sizeStyle.iconBoxSize}
                    borderRadius="10px"
                    overflow="hidden"
                    bg={variantStyle.badgeBg}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    {image ? (
                        <Box as="img" src={image} alt="" w="100%" h="100%" objectFit="cover" />
                    ) : (
                        <Icon
                            as={variantStyle.icon || Info}
                            boxSize={sizeStyle.iconSize}
                            color={variantStyle.iconColor || "grey.700"}
                        />
                    )}
                </Box>

                <Box flex="1" minW={0}>
                    {title && (
                        <Text
                            fontSize={sizeStyle.titleFontSize}
                            fontWeight="semibold"
                            color={isVariantDark || isDarkMode ? "white" : "textPrimary"}
                            noOfLines={1}
                            mb={children ? "2px" : 0}
                        >
                            {title}
                        </Text>
                    )}
                    {children && (
                        <Box
                            fontSize={sizeStyle.childrenFontSize}
                            color={isVariantDark || isDarkMode ? "whiteAlpha.700" : "textSecondary"}
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
                                size={size === "lg" ? "md" : "sm"}
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
                                color={isVariantDark || isDarkMode ? "grey.400" : undefined}
                            />
                        )}
                    </HStack>
                )}
            </HStack>
        </Card>
    );
};

export default Banner;
