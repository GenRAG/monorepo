import { Box, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { User } from "types/user";

const ProfileHero = ({ user }: { user: User }) => {
    const initials = (user.name || user.email).slice(0, 2).toUpperCase();
    const textColor = useColorModeValue("grey.700", "grey.50");
    const borderColor = useColorModeValue("grey.100", "grey.700");

    return (
        <Box borderTopRadius="14px" overflow="hidden" border="1px solid" borderBottom="none" borderColor={borderColor}>
            <HStack px={6} pt={6} pb={5} justify="space-between" align="flex-start">
                <HStack spacing={4} align="center">
                    <BoxIcon letters={initials} size="xl" />
                    <VStack align="start" spacing={1}>
                        <HStack spacing={2} flexWrap="wrap">
                            <Text fontSize="lg" fontWeight="700" color={textColor}>
                                {user.name || user.email}
                            </Text>
                        </HStack>
                        {user.name && (
                            <Text fontSize="sm" color={textColor}>
                                {user.email}
                            </Text>
                        )}
                    </VStack>
                </HStack>
            </HStack>
        </Box>
    );
};

export default ProfileHero;
