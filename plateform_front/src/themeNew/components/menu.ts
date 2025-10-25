import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

import borderRadius from 'themeNew/foundations/borderRadius';
import { textStyles } from 'themeNew/foundations/typography';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
	list: {
		borderRadius: '8px',
		boxShadow: 'none',
		borderColor: 'grey.50',
	},
	item: {
		...textStyles['body-sm-semibold'],
		color: 'font.primary',

		_hover: {
			bg: 'grey.50',
		},
		_focus: {
			bg: 'grey.50',
		},
		// 		_active : {
		// 			...textStyles['body-xs'],
		// 			// color: 'font.tertiary',
		// 			bg: 'grey.200',
		// color:"red"
		// },
	},
});

const select = definePartsStyle({
	item: {
		...textStyles['body-md'],
		p: '12px',
	},
	list: {
		borderRadius: borderRadius.xs,
		py: '0px',
	},
});

export const Menu = defineMultiStyleConfig({
	baseStyle,
	variants: {
		select,
	},
});
