import { radioAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

import borderRadius from 'themeNew/foundations/borderRadius';
import colors from 'themeNew/foundations/colors';
import { textStyles } from 'themeNew/foundations/typography';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(radioAnatomy.keys);

const baseStyle = definePartsStyle({
	container: {
		padding: 'p-sm',
		width: '100%',
		minHeight: '48px',

		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: borderRadius.xs,
		borderColor: colors.grey[100],

		_hover: {
			borderColor: colors.grey[950],
			background: colors.grey[50],
			_disabled: {
				borderColor: colors.grey[300],
			},
		},
		_disabled: {
			background: colors.grey[50],
			color: colors.font.disabled,
		},
		_checked: {
			borderColor: colors.gold[300],
			_hover: {
				borderColor: colors.grey[950],
			},
		},
	},
	control: {
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: colors.grey[200],
		background: colors.whites.white,

		_hover: {
			background: colors.whites.white,
		},

		_checked: {
			_hover: {
				background: colors.gold[300],
				borderColor: colors.whites.transparent,
			},
			_before: {
				background: colors.whites.white,
				width: '6px !important',
				height: '6px !important',
			},
			background: colors.gold[300],
			borderColor: colors.whites.transparent,
		},
		_disabled: {
			background: colors.whites.white,
			borderColor: colors.grey[200],
		},
	},
	label: {
		...textStyles['body-md'],
		width: '100%',
	},
});

const segmented = definePartsStyle({
	container: {
		borderRadius: '0',
		_first: {
			borderLeftRadius: borderRadius.xs,
			marginLeft: '0',
		},
		_notFirst: {
			marginLeft: '-1px', // Overlap left border to avoid double border
		},
		_last: {
			borderRightRadius: borderRadius.xs,
		},
		_checked: {
			zIndex: 1, // bring checked item to front so it overlaps neighbors
		},
		_hover: {
			zIndex: 2, // bring checked item to front so it overlaps neighbors
		},
	},
});

const radioTheme = defineMultiStyleConfig({
	baseStyle,
	variants: {
		segmented,
	},
});

export default radioTheme;
