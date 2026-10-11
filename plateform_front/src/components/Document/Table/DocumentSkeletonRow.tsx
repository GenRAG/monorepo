import React from "react";
import { HStack, Skeleton, SkeletonCircle, Td, Tr, VStack } from "@chakra-ui/react";

export const DocumentSkeletonRow: React.FC = () => (
    <Tr>
        <Td>
            <HStack spacing={3}>
                <Skeleton w="36px" h="36px" borderRadius="8px" />
                <VStack align="start" spacing={1.5}>
                    <Skeleton h="14px" w="160px" borderRadius="4px" />
                    <Skeleton h="10px" w="60px" borderRadius="4px" />
                </VStack>
            </HStack>
        </Td>
        <Td>
            <Skeleton h="14px" w="90px" borderRadius="4px" />
        </Td>
        <Td>
            <Skeleton h="14px" w="50px" borderRadius="4px" />
        </Td>
        <Td>
            <Skeleton h="20px" w="70px" borderRadius="full" />
        </Td>
        <Td>
            <Skeleton h="14px" w="70px" borderRadius="4px" />
        </Td>
        <Td>
            <HStack justify="flex-end">
                <SkeletonCircle size="6" />
            </HStack>
        </Td>
    </Tr>
);
