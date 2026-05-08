import React from "react";
import {
    Box,
    HStack,
    Icon,
    Progress,
    Text,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { CheckCircle2, FileText } from "lucide-react";
import { Status, UploadedSource } from "hooks/useUploadDocuments";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface DocumentFileListProps {
    sources: UploadedSource[];
}

const DocumentFileList: React.FC<DocumentFileListProps> = ({ sources }) => {
    const { colorMode } = useColorMode();

    if (sources.length === 0) return null;

    return (
        <VStack align="start" w="100%" spacing={2} mt="4px">
            <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "grey.900"}
            >
                Added files
            </Text>
            {sources.map((source, index) => (
                <Box
                    key={index}
                    w="100%"
                    p={3}
                    border={`1px solid ${colorMode === "dark" ? "grey.600" : "grey.300"}`}
                    borderRadius="8px"
                    bg={colorMode === "dark" ? "grey.700" : "grey.50"}
                >
                    <HStack spacing={3}>
                        <Icon
                            as={
                                source.status === Status.COMPLETED
                                    ? CheckCircle2
                                    : FileText
                            }
                            boxSize={4}
                            color={
                                source.status === Status.COMPLETED
                                    ? "green.500"
                                    : currentDarkTheme.primary
                            }
                        />
                        <Text
                            fontSize="sm"
                            color={colorMode === "dark" ? "white" : "grey.900"}
                        >
                            {source.name}
                        </Text>
                        {source.status === Status.PROCESSING && (
                            <Progress
                                value={50}
                                colorScheme={
                                    colorMode === "dark" ? "green" : "blue"
                                }
                                size="sm"
                                borderRadius="999px"
                                flex={1}
                            />
                        )}
                    </HStack>
                </Box>
            ))}
        </VStack>
    );
};

export default DocumentFileList;
