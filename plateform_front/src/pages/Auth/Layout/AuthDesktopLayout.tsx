import { Box, Flex, Heading, HStack, Image, Text, VStack } from '@chakra-ui/react';
import Ramify2025 from 'assetsNew/Background/Auth/2025.png';
import AuthBackground from 'assetsNew/Background/Auth/auth.png';
import RamifyLogo from 'assetsNew/logoRamify/black/black.svg';
import { ArrowLeft } from 'lucide-react';

import Button from 'components/Atoms/Button';

const AuthDesktopLayout = ({ children, canGoBack }: { children: React.ReactNode; canGoBack?: () => void }) => (
	<Box position="relative" w="100vw" h="100vh" overflow="hidden">
		<Image
			src={AuthBackground}
			alt="Login Background"
			position="absolute"
			inset={0}
			w="100%"
			h="100%"
			objectFit="cover"
			zIndex={0}
		/>

		<HStack w="100%" h="100%" position="relative" zIndex={1}>
			<VStack flex={2} h="100%" py="32px" justify="space-between" align="center" color="white">
				<Box>
					<Image src={RamifyLogo} alt="Ramify Logo" w="128px" />
				</Box>

				<Heading variant="display-2xl" textAlign="center">
					GENRAG
					<br />
					Designed by you, powered by us
				</Heading>

				<VStack align="center">
					<Image src={Ramify2025} alt="Ramify 2025" w="100px" />
					<Text variant="display-lg" textAlign="center" color="grey.500">
						Élue institution la plus innovante <br /> par Patrimonia, CF News et Inter Invest
					</Text>
				</VStack>
			</VStack>

			<Flex flex="1" h="100%" bg="white" justify="center" position="relative" zIndex="2">
				{canGoBack && (
					<Box position="absolute" top="24px" left="24px" zIndex="3">
						<Button
							btnType="icon"
							icon={ArrowLeft}
							variant="secondary"
							onClick={canGoBack}
							aria-label="Revenir en arrière"
						/>
					</Box>
				)}
				<Flex w="100%" maxW="60%" direction="column" gap="32px" justify="center">
					{children}
				</Flex>
			</Flex>
		</HStack>
	</Box>
);

export default AuthDesktopLayout;
