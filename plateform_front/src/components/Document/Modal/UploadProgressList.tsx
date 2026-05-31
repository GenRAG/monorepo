import React from "react";
import { Box, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { CheckCircle, X } from "lucide-react";
import useUploadDocuments, { Status } from "hooks/useUploadDocuments";

interface UploadProgressListProps {
    sources: ReturnType<typeof useUploadDocuments>["sources"];
}

const UploadProgressList: React.FC<UploadProgressListProps> = ({ sources }) => {
    if (sources.length === 0) return null;

    return (
        <VStack align="stretch" spacing={1}>
            {sources.map((source) => {
                const done = source.status === Status.COMPLETED;
                const failed = source.status === Status.ERROR;
                const pct = source.progress;

                return (
                    <HStack key={source.id} px={1} py={2} spacing={3} align="center">
                        <Box
                            flexShrink={0}
                            w="16px"
                            h="16px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {done ? (
                                <CheckCircle size={16} color="#10B981" />
                            ) : failed ? (
                                <X size={16} color="#EF4444" />
                            ) : (
                                <Spinner size="xs" color="grey.400" />
                            )}
                        </Box>
                        <Text fontSize="13px" color="textPrimary" flex={1} noOfLines={1}>
                            {source.name}
                        </Text>
                        <Box flex={2} position="relative">
                            <Box h="4px" borderRadius="full" bg="borderDefault" overflow="hidden">
                                <Box
                                    h="100%"
                                    w={`${pct}%`}
                                    bg={failed ? "red.500" : "green.500"}
                                    transition="width 0.3s ease"
                                    borderRadius="full"
                                />
                            </Box>
                        </Box>
                        <Text
                            fontSize="12px"
                            color={done ? "green.500" : failed ? "red.400" : "textMuted"}
                            fontWeight="500"
                            w="36px"
                            textAlign="right"
                        >
                            {pct}%
                        </Text>
                    </HStack>
                );
            })}
        </VStack>
    );
};

export default UploadProgressList;
