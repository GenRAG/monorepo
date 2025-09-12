import { tableAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

import colors from 'themeNew/foundations/colors';
import { textStyles } from 'themeNew/foundations/typography';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tableAnatomy.keys);

// https://v2.chakra-ui.com/docs/components/table/theming

const patrimony = definePartsStyle((props) => ({
	tr: {},
	th: {
		px: '4px',
		'&[data-is-numeric=true]': {
			textAlign: 'end',
		},
	},
	td: {
		px: '4px',
		'&[data-is-numeric=true]': {
			textAlign: 'end',
		},
	},
	thead: {
		th: {
			...textStyles['caption-sm'],
			color: 'font.info',
			letterSpacing: '0px',
			textTransform: 'none',
		},
	},
	tbody: {
		tr: {
			px: '4px',
		},
		td: {
			...textStyles['body-sm'],
			color: 'font.primary',
			letterSpacing: '0px',
			px: '4px',
			py: '8px',
		},
	},
}));

export const tableTheme = defineMultiStyleConfig({
	variants: { patrimony },
});
