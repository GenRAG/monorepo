import { useCallback, useMemo } from 'react';
import { X, TriangleAlert, Info, Star, Check } from 'lucide-react';
import { HStack, Text, useToast, UseToastOptions, VStack, Box } from '@chakra-ui/react';

import colors from 'themeNew/foundations/colors';
import { isNotNone } from 'utils/isNotNone';
import standaloneToast from 'utils/standaloneToast';

const getIconFromStatus = (status: string | undefined) => {
	if (status === 'success') return <Check color={getTextColorFromStatus(status)} size="44" />;
	if (status === 'error') return <TriangleAlert color={getTextColorFromStatus(status)} size="44" />;
	if (status === 'warning') return <TriangleAlert color={getTextColorFromStatus(status)} size="44" />;
	if (status === 'info') return <Info color={getTextColorFromStatus(status)} size="44" />;
	if (status === 'favorite') return <Star color={getTextColorFromStatus(status)} size="44" />;
	return <Info />;
};

const getGlassBgFromStatus = (status: string | undefined): string => {
    if (status === 'success') return colors.liquidGlass.success;
    if (status === 'error') return colors.liquidGlass.error;
    if (status === 'warning') return colors.liquidGlass.warning;
    if (status === 'info') return colors.liquidGlass.info;
    if (status === 'favorite') return colors.liquidGlass.favorite;
    return colors.liquidGlass.default;
}

const getTextColorFromStatus = (status: string | undefined): string => {
	if (status === 'success') return colors.whites.offwhite;
	if (status === 'error') return colors.whites.offwhite;
	if (status === 'warning') return colors.gold[900];
	if (status === 'info') return colors.blue[900];
	return colors.blue[900];
};

const themedToast = (options: UseToastOptions, onClose: () => void) => (
  <HStack
    bg={getGlassBgFromStatus(options.status)}
    p="16px"
    align="start"
    gap="8px"
    justify="space-between"
    borderRadius="16px"
    boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
    backdropFilter="blur(12px)"
    border="1px solid rgba(255, 255, 255, 0.3)"
  >
    <Box alignSelf="stretch" display="flex" alignItems="center">
      {options.icon ?? getIconFromStatus(options.status)}
    </Box>
    <VStack align="start" w="100%">
      {isNotNone(options.title) && (
        <Text color={getTextColorFromStatus(options.status)} variant="Text-M-Bold">
          {options.title}
        </Text>
      )}
      {isNotNone(options.description) && (
        <Text color={getTextColorFromStatus(options.status)} variant="Text-S-Medium">
          {options.description}
        </Text>
      )}
    </VStack>
    {options.isClosable && (
      <X
        color={getTextColorFromStatus(options.status)}
        onClick={onClose}
        fontSize="14px"
        cursor="pointer"
      />
    )}
  </HStack>
)


const useThemedToast = () => {
	const toast = useToast();

	const returnFunction = useCallback(
		(options: UseToastOptions) =>
			toast({
				id: options.id,
				render: ({ onClose }) => themedToast(options, onClose),
				...options,
			}),
		[toast],
	);

	return useMemo(() => Object.assign(returnFunction, toast), [returnFunction, toast]);
};

export const createStandaloneThemedToast = () => {
	const returnFunction = (options: UseToastOptions) =>
		standaloneToast({
			id: options.id,
			render: ({ onClose }) => themedToast(options, onClose),
		});
	return Object.assign(returnFunction, standaloneToast);
};

export default useThemedToast;
