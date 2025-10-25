import { Box, Image, Stack, Text, VStack } from '@chakra-ui/react';
import Ramify2025 from 'assetsNew/Background/Auth/2025.png';
import AuthBackground from 'assetsNew/Background/Auth/auth.png';
import RamifyLogo from 'assetsNew/logoRamify/black/black.svg';
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
	const backgroundStyles = showBackground
		? {
				bgGradient: 'linear(to-b, white 67%, transparent)',
				bgColor: 'transparent',
		  }
		: {
				bgGradient: undefined,
				bgColor: 'white',
		  };

	return (
		<Box w="100vw" h="100dvh" overflow="hidden" py="20px">
			{showBackground && (
				<Image
					src={AuthBackground}
					alt="Login Background"
					position="absolute"
					bottom="0"
					left="0"
					w="100%"
					h="50%"
					objectFit="cover"
					zIndex="0"
				/>
			)}
			<Box
				position="absolute"
				top="0"
				left="0"
				w="100%"
				h="100%"
				bgGradient={backgroundStyles.bgGradient}
				bgColor={backgroundStyles.bgColor}
				zIndex="1"
				pointerEvents="none"
			/>

			<Stack direction="row" h="100%" position="relative" zIndex="2" justify="center">
				<VStack w="80%" justify="space-between">
					<VStack w="100%" align="center" gap="32px">
						<Image src={RamifyLogo} alt="Ramify Logo" w="128px" />

						{canGoBack && (
							<Box position="absolute" left="20px" zIndex="3">
								<Button
									btnType="icon"
									size="sm"
									icon={ArrowLeft}
									variant="secondary"
									onClick={canGoBack}
									aria-label="Revenir en arrière"
								/>
							</Box>
						)}
						<Box w="100%" justifyItems="center">
							{children}
						</Box>
					</VStack>

					{showBackground && (
						<VStack w="100%" align="center">
							<Image src={Ramify2025} alt="Ramify 2025" w="100px" />
							<Text variant="display-lg" textAlign="center" color="grey.500">
								Élue institution la plus innovante <br /> par Patrimonia, CF News et Inter Invest
							</Text>
						</VStack>
					)}
				</VStack>
			</Stack>
		</Box>
	);
};

export default AuthMobileLayout;
