import { switchAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

import colors from 'themeNew/foundations/colors';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(switchAnatomy.keys);

const baseStyle = definePartsStyle({
	thumb: {
		bg: colors.whites.white,
	},
	track: {
		bg: colors.grey[100],
		_checked: {
			bg: colors.gold[300],
		},
	},
});

export default defineMultiStyleConfig({ baseStyle });
