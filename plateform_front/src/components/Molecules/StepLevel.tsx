import { Box, Circle, HStack, Text, useColorMode, VStack } from "@chakra-ui/react"
import { currentDarkTheme } from 'themeNew/foundations/themeConfig';

interface StepLevelProps {
    level: number;
    title: string;
    description: string;
}

const StepLevel: React.FC<StepLevelProps> = ({ level, description, title }) => {

    const { colorMode } = useColorMode();

    return(
        <Box
            w="100%"
            p={4}
            bg={colorMode === 'dark' ? 'grey.700' : 'grey.50'}
            borderRadius="12px"
            border={`1px solid ${colorMode === 'dark' ? 'grey.600' : 'grey.200'}`}
        >
            <HStack spacing={3}>
                <Circle size="40px" bg={currentDarkTheme.primary} color="white">
                    <Text fontSize="sm" fontWeight="bold">
                        {level}/5
                    </Text>
                </Circle>
                <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="semibold" color={colorMode === 'dark' ? 'white' : 'grey.900'}>
                        RAG Level : {level} / 5 — {title}
                    </Text>
                    <Text fontSize="xs" color={colorMode === 'dark' ? 'grey.400' : 'grey.500'}>
                        {description}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    )
}

export default StepLevel;