import { popoverAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

import colors from 'themeNew/foundations/colors';

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(popoverAnatomy.keys);

// Important to use backgroundColor and not bg, to enable stripes
const Popover = defineMultiStyleConfig({
	baseStyle: {
		content: {
			borderRadius: '8px',
			borderColor: colors.grey[50],
		},
		header: {
			borderColor: colors.grey[50],
		},
		footer: {
			borderColor: colors.grey[50],
		},
	},
	defaultProps: {},
});

export default Popover;
