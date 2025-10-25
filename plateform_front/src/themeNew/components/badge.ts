import { textStyles } from 'themeNew/foundations/typography';

export type BadgeProps = {
	colorScheme: 'gold' | 'white' | 'green' | 'olive' | 'red' | 'transparent' | 'grey' | 'blue' | 'lightGold';
	size: 'lg' | 'md' | 'sm' | 'xs' | '2xs';
};

const getColorScheme = (colorScheme: BadgeProps['colorScheme']) => {
	const badgeColors = {
		gold: {
			bg: 'gold.200',
			color: 'font.primary',
		},
		mediumGold: {
			bg: 'gold.100',
			color: 'grey.950',
		},
		lightGold: {
			bg: 'gold.50',
			color: 'grey.950',
		},

		green: {
			bg: 'green.50',
			color: 'green.600',
		},
		olive: {
			bg: 'olive.50',
			color: 'olive.600',
		},
		red: {
			bg: 'red.50',
			color: 'red.600',
		},
		grey: {
			bg: 'grey.50',
			color: 'font.primary',
		},
		blue: {
			bg: 'blue.50',
			color: 'blue.900',
		},

		white: {
			bg: 'whites.white',
			color: 'font.primary',
		},
		transparent: {
			bg: 'transparent',
			color: 'font.primary',
		},
		semiTransparent: {
			bg: 'whites.lightwhite',
			color: 'font.primary',
		},
	};

	return badgeColors[colorScheme];
};

const Badge = {
	sizes: {
		lg: {
			padding: '12px 16px',
			...textStyles['caption-md'],
		},
		md: {
			padding: '6px 12px',
			...textStyles['caption-sm'],
		},
		sm: {
			padding: '4px 8px',
			...textStyles['caption-sm'],
		},
		xs: {
			padding: '4px 8px',
			...textStyles['caption-xs'],
		},
		'2xs': {
			padding: '2px 4px',
			...textStyles['caption-xs'],
		},
	},

	variants: {
		// We are forced to set colorScheme in variants, due to the way Chakra V2 handle colorScheme
		// (It's not overriden if set in baseStyle)
		base: (props: BadgeProps) => ({
			borderRadius: '4px',
			borderWidth: '0px',
			...getColorScheme(props.colorScheme ?? 'gold'),
		}),

		// Used for performances for example
		numberRounded: (props: BadgeProps) => ({
			borderRadius: 'full',
			padding: '0px 8px',
			...textStyles['body-sm-semibold'],
			textTransform: 'uppercase',
			...getColorScheme(props.colorScheme ?? 'gold'),
		}),
	},

	defaultProps: {
		variant: 'base',
		size: 'md',
		colorScheme: 'gold',
	},
};

export default Badge;
