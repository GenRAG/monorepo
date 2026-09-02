import React from "react";
import { Box, HStack, Progress, Text, VStack } from "@chakra-ui/react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Status, UploadedSource } from "hooks/useUploadDocuments";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import BoxIcon from "components/ui/BoxIcon";

interface DocumentFileListProps {
    sources: UploadedSource[];
}

const statusConfig = {
    [Status.UPLOADING]: {
        icon: Loader2,
        color: currentDarkTheme.primary,
        showProgress: true,
        progressValue: 25,
        spin: true,
    },
    [Status.PROCESSING]: {
        icon: Loader2,
        color: currentDarkTheme.primary,
        showProgress: true,
        progressValue: 60,
        spin: true,
    },
    [Status.COMPLETED]: {
        icon: CheckCircle2,
        color: "green.500",
        showProgress: false,
        progressValue: 100,
        spin: false,
    },
    [Status.ERROR]: {
        icon: AlertCircle,
        color: "red.400",
        showProgress: false,
        progressValue: 0,
        spin: false,
    },
};

const DocumentFileList: React.FC<DocumentFileListProps> = ({ sources }) => {
    if (sources.length === 0) return null;

    return (
        <VStack align="start" w="100%" spacing={2} mt="4px" overflow="auto">
            <Text fontWeight="semibold" color="textStrong">
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
                        borderColor="borderDefault"
                        borderRadius="8px"
                        bg="surfaceAction"
                    >
                        <HStack spacing={3}>
                            <BoxIcon
                                icon={config.icon}
                                color={config.color}
                                bg="surfaceThumbnail"
                                size="sm"
                                spin={config.spin}
                            />
                            <Text fontSize="sm" color="textStrong" flex={1} noOfLines={1}>
                                {source.name}
                            </Text>
                            {config.showProgress && (
                                <Progress
                                    value={config.progressValue}
                                    colorScheme="green"
                                    bg="surfaceThumbnail"
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
