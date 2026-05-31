import React from "react";
import { Box, HStack, Icon, Progress, Text, VStack, useColorMode } from "@chakra-ui/react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Status, UploadedSource } from "hooks/useUploadDocuments";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface DocumentFileListProps {
    sources: UploadedSource[];
}

const statusConfig = {
    [Status.UPLOADING]: {
        icon: Loader2,
        color: currentDarkTheme.primary,
        showProgress: true,
        progressValue: 25,
    },
    [Status.PROCESSING]: {
        icon: Loader2,
        color: currentDarkTheme.primary,
        showProgress: true,
        progressValue: 60,
    },
    [Status.COMPLETED]: {
        icon: CheckCircle2,
        color: "green.500",
        showProgress: false,
        progressValue: 100,
    },
    [Status.ERROR]: {
        icon: AlertCircle,
        color: "red.400",
        showProgress: false,
        progressValue: 0,
    },
};

const DocumentFileList: React.FC<DocumentFileListProps> = ({ sources }) => {
    const { colorMode } = useColorMode();

    if (sources.length === 0) return null;

    return (
        <VStack align="start" w="100%" spacing={2} mt="4px">
            <Text fontWeight="semibold" color={colorMode === "dark" ? "white" : "grey.900"}>
                Fichiers ajoutés
            </Text>
            {sources.map((source, index) => {
                const config = statusConfig[source.status];
                return (
                    <Box
                        key={index}
                        w="100%"
                        p={3}
                        border="1px solid"
                        borderColor={colorMode === "dark" ? "grey.600" : "grey.300"}
                        borderRadius="8px"
                        bg={colorMode === "dark" ? "grey.700" : "grey.50"}
                    >
                        <HStack spacing={3}>
                            <Icon as={config.icon} boxSize={4} color={config.color} flexShrink={0} />
                            <Text
                                fontSize="sm"
                                color={colorMode === "dark" ? "white" : "grey.900"}
                                flex={1}
                                noOfLines={1}
                            >
                                {source.name}
                            </Text>
                            {config.showProgress && (
                                <Progress
                                    value={config.progressValue}
                                    colorScheme="green"
                                    size="sm"
                                    borderRadius="999px"
                                    w="80px"
                                    flexShrink={0}
                                    isIndeterminate={
                                        source.status === Status.PROCESSING || source.status === Status.UPLOADING
                                    }
                                />
                            )}
                        </HStack>
                    </Box>
                );
            })}
        </VStack>
    );
};

export default DocumentFileList;
