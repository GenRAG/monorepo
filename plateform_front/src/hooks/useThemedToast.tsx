import { useCallback, useMemo, useState } from "react";
import { X, TriangleAlert, Info, Star, Check, ChevronUp } from "lucide-react";
import {
    HStack,
    Text,
    useToast,
    UseToastOptions,
    VStack,
    Box,
    useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

import colors from "themeNew/foundations/colors";
import { isNotNone } from "utils/isNotNone";
import standaloneToast from "utils/standaloneToast";

const shrink = keyframes`
    from { width: 100%; }
    to { width: 0%; }
`;

const getAccentColorFromStatus = (status: string | undefined): string => {
    if (status === "success") return colors.green[500];
    if (status === "error") return colors.red[500];
    if (status === "warning") return colors.gold[500];
    if (status === "info") return colors.blue[500];
    if (status === "favorite") return colors.gold[500];
    return colors.blue[500];
};

const getProgressColorFromStatus = (status: string | undefined): string => {
    if (status === "success") return colors.green[400];
    if (status === "error") return colors.red[400];
    if (status === "warning") return colors.gold[400];
    if (status === "info") return colors.blue[400];
    return colors.blue[400];
};

const getIconFromStatus = (status: string | undefined) => {
    const color = getAccentColorFromStatus(status);
    if (status === "success") return <Check color={color} size={20} />;
    if (status === "error") return <TriangleAlert color={color} size={20} />;
    if (status === "warning") return <TriangleAlert color={color} size={20} />;
    if (status === "info") return <Info color={color} size={20} />;
    if (status === "favorite") return <Star color={color} size={20} />;
    return <Info color={color} size={20} />;
};

type ThemedToastProps = {
    options: UseToastOptions;
    onClose: () => void;
};

const ThemedToastComponent = ({ options, onClose }: ThemedToastProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const [paused, setPaused] = useState(false);

    const duration = options.duration ?? 5000;
    const hasDescription = isNotNone(options.description);
    const accentColor = getAccentColorFromStatus(options.status);
    const progressColor = getProgressColorFromStatus(options.status);

    const titleColor = useColorModeValue("grey.900", "white");
    const descriptionColor = useColorModeValue("grey.600", "grey.300");
    const iconBg = useColorModeValue(`${accentColor}18`, `${accentColor}30`);
    const actionColor = useColorModeValue("grey.800", "grey.100");
    const actionHoverBg = useColorModeValue("grey.50", "grey.700");
    const actionHoverBorderColor = useColorModeValue("grey.300", "grey.500");
    const controlColor = useColorModeValue("grey.400", "grey.500");
    const controlHoverBg = useColorModeValue("grey.50", "grey.700");
    const controlHoverColor = useColorModeValue("grey.700", "grey.200");

    return (
        <Box
            bg="surfaceCard"
            borderRadius="16px"
            boxShadow={useColorModeValue(
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
                "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
            )}
            border="1px solid"
            borderColor="borderSubtle"
            overflow="hidden"
            minW="320px"
            maxW="420px"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Header */}
            <HStack
                px="16px"
                pt="16px"
                pb={collapsed || !hasDescription ? "16px" : "8px"}
                spacing="10px"
                align="center"
            >
                <Box
                    w="32px"
                    h="32px"
                    borderRadius="full"
                    bg={iconBg}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    {options.icon ?? getIconFromStatus(options.status)}
                </Box>

                <Text
                    flex="1"
                    fontSize="sm"
                    fontWeight="semibold"
                    color={titleColor}
                    noOfLines={1}
                >
                    {options.title}
                </Text>

                <HStack spacing="4px">
                    {hasDescription && (
                        <Box
                            as="button"
                            w="28px"
                            h="28px"
                            borderRadius="8px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color={controlColor}
                            _hover={{ bg: controlHoverBg, color: controlHoverColor }}
                            transition="all 0.15s"
                            onClick={() => setCollapsed((c) => !c)}
                            transform={collapsed ? "rotate(180deg)" : "rotate(0deg)"}
                        >
                            <ChevronUp size={16} />
                        </Box>
                    )}
                    <Box
                        as="button"
                        w="28px"
                        h="28px"
                        borderRadius="8px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color={controlColor}
                        _hover={{ bg: controlHoverBg, color: controlHoverColor }}
                        transition="all 0.15s"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </Box>
                </HStack>
            </HStack>

            {/* Description + bouton action */}
            {!collapsed && hasDescription && (
                <VStack align="start" px="16px" pb="16px" spacing="12px">
                    <Text fontSize="sm" color={descriptionColor} lineHeight="1.5">
                        {options.description}
                    </Text>

                    {(options as any).actionLabel && (
                        <Box
                            as="button"
                            px="16px"
                            py="8px"
                            borderRadius="10px"
                            border="1.5px solid"
                            borderColor="borderStrong"
                            fontSize="sm"
                            fontWeight="medium"
                            color={actionColor}
                            bg="surfaceAction"
                            _hover={{ bg: actionHoverBg, borderColor: actionHoverBorderColor }}
                            transition="all 0.15s"
                            onClick={(options as any).onAction}
                        >
                            {(options as any).actionLabel}
                        </Box>
                    )}
                </VStack>
            )}

            {/* Barre de progression */}
            <Box h="3px" bg="borderSubtle" w="100%">
                <Box
                    h="100%"
                    bg={progressColor}
                    borderRadius="full"
                    animation={`${shrink} ${duration}ms linear forwards`}
                    style={{
                        animationPlayState: paused ? "paused" : "running",
                    }}
                />
            </Box>
        </Box>
    );
};

const useThemedToast = () => {
    const toast = useToast();

    const returnFunction = useCallback(
        (options: UseToastOptions) =>
            toast({
                id: options.id,
                duration: options.duration ?? 5000,
                render: ({ onClose }) => (
                    <ThemedToastComponent options={options} onClose={onClose} />
                ),
                ...options,
            }),
        [toast],
    );

    return useMemo(
        () => Object.assign(returnFunction, toast),
        [returnFunction, toast],
    );
};

export const createStandaloneThemedToast = () => {
    const returnFunction = (options: UseToastOptions) =>
        standaloneToast({
            id: options.id,
            render: ({ onClose }) => (
                <ThemedToastComponent options={options} onClose={onClose} />
            ),
        });
    return Object.assign(returnFunction, standaloneToast);
};

export default useThemedToast;