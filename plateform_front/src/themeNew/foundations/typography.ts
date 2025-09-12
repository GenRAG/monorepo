import { HeadingProps, TextProps } from '@chakra-ui/react';

import colors from './colors';
import fonts from './fonts';

export const baseTextStyle = {
	color: colors.font.primary,
	fontFamily: fonts.body,
	fontWeight: 'normal',
	lineHeight: 'normal',
};

export const baseHeadingStyle = {
	color: colors.font.primary,
	fontFamily: fonts.heading,
	fontWeight: 'medium',
	lineHeight: 'normal',
};

export const baseDisplayStyle = {
	color: colors.font.primary,
	fontFamily: fonts.display,
	fontWeight: 'normal',
	lineHeight: 'normal',
};

export const baseNumberStyle = {
	color: colors.font.primary,
	fontFamily: fonts.number,
	fontWeight: 'normal',
	lineHeight: 'normal',
	letterSpacing: '1px',
};

const displays = {
	'display-2xl': {
		...baseDisplayStyle,
		// chakra doesn't support responsive fontSize for heading so we define them at css level
		fontSize: 'var(--genrag-heading-size-2xl)',
	},
	'display-xl': {
		...baseDisplayStyle,
		fontSize: 'var(--genrag-heading-size-xl)',
	},
	'display-lg': {
		...baseDisplayStyle,
		fontSize: 'var(--genrag-heading-size-lg)',
	},
	'display-md': {
		...baseDisplayStyle,
		fontSize: 'var(--genrag-heading-size-md)',
	},
	'display-sm': {
		...baseDisplayStyle,
		fontSize: 'var(--genrag-heading-size-sm)',
	},
	'display-xs': {
		...baseDisplayStyle,
		fontSize: 'var(--genrag-heading-size-xs)',
	},
} satisfies Record<string, TextProps & HeadingProps>;

const headings = {
	'heading-2xl': {
		...baseHeadingStyle,
		fontSize: 'var(--genrag-heading-size-2xl)',
	},
	'heading-xl': {
		...baseHeadingStyle,
		fontSize: 'var(--genrag-heading-size-xl)',
	},
	'heading-lg': {
		...baseHeadingStyle,
		fontSize: 'var(--genrag-heading-size-lg)',
	},
	'heading-md': {
		...baseHeadingStyle,
		fontSize: 'var(--genrag-heading-size-md)',
	},
	'heading-sm': {
		...baseHeadingStyle,
		fontSize: 'var(--genrag-heading-size-sm)',
	},
	'heading-xs': {
		...baseHeadingStyle,
		fontSize: 'var(--genrag-heading-size-xs)',
	},
} satisfies Record<string, TextProps & HeadingProps>;

const number = {
	'number-3xl': {
		...baseNumberStyle,
		fontSize: 'var(--genrag-heading-size-3xl)',
	},
	'number-2xl': {
		...baseNumberStyle,
		fontSize: 'var(--genrag-heading-size-2xl)',
	},
	'number-xl': {
		...baseNumberStyle,
		fontSize: 'var(--genrag-heading-size-xl)',
	},
	'number-lg': {
		...baseNumberStyle,
		fontSize: 'var(--genrag-heading-size-lg)',
	},
	'number-md': {
		...baseNumberStyle,
		fontSize: 'var(--genrag-heading-size-md)',
	},
	'number-sm': {
		...baseNumberStyle,
		fontSize: 'var(--genrag-heading-size-sm)',
	},
} satisfies Record<string, TextProps & HeadingProps>;

const body = {
	// Regular
	'body-xl': {
		...baseTextStyle,
		fontSize: { base: '20px', xl: '20px' },
	},
	'body-lg': {
		...baseTextStyle,
		fontSize: { base: '18px', xl: '18px' },
	},
	'body-md': {
		...baseTextStyle,
		fontSize: { base: '16px', xl: '16px' },
	},
	'body-sm': {
		...baseTextStyle,
		fontSize: { base: '14px', xl: '14px' },
	},

	'body-xs': {
		...baseTextStyle,
		fontSize: { base: '12px', xl: '12px' },
	},
	'body-2xs': {
		...baseTextStyle,
		fontSize: { base: '11px', xl: '11px' },
	},

	// Semibold
	'body-xl-semibold': {
		...baseTextStyle,
		fontSize: { base: '20px', xl: '20px' },
		fontWeight: 'semibold',
	},
	'body-lg-semibold': {
		...baseTextStyle,
		fontSize: { base: '18px', xl: '18px' },
		fontWeight: 'semibold',
	},
	'body-md-semibold': {
		...baseTextStyle,
		fontSize: { base: '16px', xl: '16px' },
		fontWeight: 'semibold',
	},
	'body-sm-semibold': {
		...baseTextStyle,
		fontSize: { base: '14px', xl: '14px' },
		fontWeight: 'semibold',
	},
	'body-xs-semibold': {
		...baseTextStyle,
		fontSize: { base: '12px', xl: '12px' },
		fontWeight: 'semibold',
	},
	'body-2xs-semibold': {
		...baseTextStyle,
		fontSize: { base: '11px', xl: '11px' },
		fontWeight: 'semibold',
	},

	'paragraph-sm': {
		...baseTextStyle,
		fontSize: { base: '14px', xl: '14px' },
		lineHeight: '20px',
	},
} satisfies Record<string, TextProps & HeadingProps>;

const caption = {
	'caption-xl': {
		...baseTextStyle,
		fontSize: { base: '18px', xl: '18px' },
		fontWeight: 'normal',
		letterSpacing: '1px',
		textTransform: 'uppercase',
	},
	'caption-lg': {
		...baseTextStyle,
		fontSize: { base: '16px', xl: '16px' },
		fontWeight: 'normal',
		letterSpacing: '1px',
		textTransform: 'uppercase',
	},
	'caption-md': {
		...baseTextStyle,
		fontSize: { base: '14px', xl: '14px' },
		fontWeight: 'normal',
		letterSpacing: '1px',
		textTransform: 'uppercase',
	},
	'caption-sm': {
		...baseTextStyle,
		fontSize: { base: '12px', xl: '12px' },
		fontWeight: 'normal',
		letterSpacing: '1px',
		textTransform: 'uppercase',
	},
	'caption-xs': {
		...baseTextStyle,
		fontSize: { base: '10px', xl: '10px' },
		fontWeight: 'normal',
		letterSpacing: '1px',
		textTransform: 'uppercase',
	},
	'caption-xs-semibold': {
		...baseTextStyle,
		fontSize: { base: '10px', xl: '10px' },
		fontWeight: 'semibold',
		letterSpacing: '1px',
		textTransform: 'uppercase',
	},
} satisfies Record<string, TextProps & HeadingProps>;

const headingStyles = {
	...displays,
	...headings,
	...number,
} satisfies Record<string, TextProps & HeadingProps>;

const textStyles = {
	...body,
	...caption,
} satisfies Record<string, TextProps & HeadingProps>;

export { headingStyles, textStyles };
