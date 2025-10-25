import { Box, Flex, Heading, HStack, Image, Stack, Text, VStack } from '@chakra-ui/react';
import Ramify2025 from 'assetsNew/Background/Auth/2025.png';
import RamifyLogo from 'assetsNew/logoRamify/black/black.svg';
import { ArrowLeft } from 'lucide-react';

import Button from 'components/Atoms/Button';
import Spline from "@splinetool/react-spline";
import borderRadius from 'themeNew/foundations/borderRadius';

const AuthDesktopLayout = ({ children, canGoBack }: { children: React.ReactNode; canGoBack?: () => void }) => (
  <HStack w="100vw" h="100vh" spacing={0} overflow="hidden" bg="grey.900">
    <VStack
      flex={2}
      h="100%"
      justify="space-between"
      align="center"
      color="white"
    >
      <Box
        w="100%"
        h="100%"
        position="relative"
        overflow="hidden"
      >
        <Spline scene="https://prod.spline.design/oGfU79F9PBiemGiY/scene.splinecode" />
      </Box>
    </VStack>
    <Heading position="absolute" top="24px" left="6%" transform="translateX(-50%)" zIndex={3} color="whites.offwhite" variant="display-2xl">
      GenRAG
    </Heading>

    <Flex flex={1} h="100%" justify="center" position="relative">
      {canGoBack && (
        <Box position="absolute" top="24px" left="24px" zIndex={3}>
          <Button
            btnType="icon"
            icon={ArrowLeft}
            variant="secondary"
            onClick={canGoBack}
            aria-label="Revenir en arrière"
          />
        </Box>
      )}
      <Flex w="100%" maxW="80%" direction="column" gap="32px" justify="center">
        {children}
      </Flex>
    </Flex>
  </HStack>
);

export default AuthDesktopLayout;
