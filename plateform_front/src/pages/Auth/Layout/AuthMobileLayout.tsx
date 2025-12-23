import { Box, Heading, Icon, Stack, VStack } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import Button from 'components/Atoms/Button';

const AuthMobileLayout = ({
  showBackground,
  canGoBack,
  children,
}: {
  showBackground: boolean | undefined;
  canGoBack?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Box w="100vw" py="20px">
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bgColor="grey.900"
        zIndex="1"
        pointerEvents="none"
      />

      <Stack direction="row" h="100%" position="relative" zIndex="2" justify="center" align="center">
        <VStack w="80%" justify="center" h="100%" spacing="32px">
           {canGoBack && (
				<Box position="absolute" top="24px" left="24px" zIndex={3}>
					<Icon as={ArrowLeft} boxSize={6} cursor="pointer" color="whites.offwhite" onClick={canGoBack} />
				</Box>
			)}
		  <Heading variant="heading-2xl" color="whites.offwhite">GenRAG</Heading>
          <Box w="100%">
            {children}
          </Box>
        </VStack>
      </Stack>
    </Box>
  );
};

export default AuthMobileLayout;
