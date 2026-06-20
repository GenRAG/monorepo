import React from "react";
import { HStack, Skeleton, SkeletonCircle, Td, Tr } from "@chakra-ui/react";

export const DocumentSkeletonRow: React.FC = () => (
    <Tr>
        <Td>
            <HStack spacing={3}>
                <Skeleton w="32px" h="32px" borderRadius="6px" />
                <Skeleton h="14px" w="140px" borderRadius="4px" />
            </HStack>
        </Td>
        <Td>
            <Skeleton h="14px" w="50px" borderRadius="4px" />
        </Td>
        <Td>
            <Skeleton h="14px" w="40px" borderRadius="4px" />
        </Td>
        <Td>
            <Skeleton h="20px" w="80px" borderRadius="full" />
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
