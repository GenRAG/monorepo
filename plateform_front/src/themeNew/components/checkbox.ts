import { checkboxAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

import borderRadius from 'themeNew/foundations/borderRadius';
import colors from 'themeNew/foundations/colors';
import { textStyles } from 'themeNew/foundations/typography';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(checkboxAnatomy.keys);

const simpleGold = definePartsStyle({
	control: {
		height: '20px',
		width: '20px',

		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: borderRadius.xs,
		borderColor: colors.grey[100],
		background: colors.whites.white,

		_checked: {
			_hover: {
				color: colors.grey[950],
				background: colors.gold[300],
				borderColor: colors.whites.transparent,
			},
			color: colors.grey[950],
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
	},
});

const goldWithContainer = definePartsStyle({
	container: {
		padding: '16px 12px',
		width: '100%',
		height: '48px',
		gap: '12px',

		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: borderRadius.xs,
		borderColor: colors.grey[100],

		flexDirection: 'row-reverse',
		justifyContent: 'space-between',

		background: colors.whites.white,
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
		},
	},
	...simpleGold,
});

const black = definePartsStyle({
	label: {
		...textStyles['body-md'],
	},
	icon: {
		color: 'content.white',
		w: '12px',
	},
	control: {
		bg: 'content.black',
		padding: '2px',
		boxSize: '16px',
		borderRadius: '4px',
		borderWidth: '0px',

		_checked: {
			bg: 'content.black',
			boxSize: '16px',
		},

		_hover: {
			bg: 'grey.700 !important',
			cursor: 'pointer',
		},
	},
});

const checkboxTheme = defineMultiStyleConfig({
	variants: {
		gold: goldWithContainer,
		black,
		simple: simpleGold,
	},

	defaultProps: {
		variant: 'gold',
	},
});

export default checkboxTheme;
