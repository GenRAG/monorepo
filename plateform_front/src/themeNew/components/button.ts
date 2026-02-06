import { StyleFunctionProps } from '@chakra-ui/styled-system';

import borderRadius from 'themeNew/foundations/borderRadius';
import colors from 'themeNew/foundations/colors';
import { shadow } from 'themeNew/foundations/shadow';
import { darkThemeColors } from 'themeNew/foundations/themeConfig';
import { textStyles } from 'themeNew/foundations/typography';

const Button = {
	baseStyle: {
		borderRadius: borderRadius.xs,
		// Prevent default chakra ui setting opacity to 0.4 when disabled
		_disabled: {
			opacity: '1',
		},
	},

	sizes: {
		xl: {
			paddingX: '32px',
			paddingY: '16px',
			...textStyles['body-md-semibold'],
		},
		lg: {
			paddingX: '24px',
			paddingY: '12px',
			...textStyles['body-sm-semibold'],
		},
		md: {
			paddingX: '16px',
			paddingY: '8px',
			...textStyles['body-sm-semibold'],
		},
		sm: {
			paddingX: '12px',
			paddingY: '8px',
			...textStyles['body-xs-semibold'],
		},
		xs: {
			paddingX: '8px',
			paddingY: '4px',
			...textStyles['body-2xs-semibold'],
		},
	},

	variants: {
		superPrimary: (props: StyleFunctionProps) => {
			const disabled = props.isDisabled || props.disabled || props.isLoading;

			return {
				color: disabled ? colors.grey[300] : colors.font.white,
				cursor: disabled ? 'not-allowed' : 'pointer',

				background: disabled
					? `radial-gradient(100% 141.54% at 100% 0%, rgba(211, 212, 212, 0.1) 0%, rgba(121, 123, 123, 0.1) 100%),radial-gradient(19.03% 80.19% at 45.64% 100%, rgba(205, 184, 140, 0.31) 0%, rgba(151, 102, 0, 0) 100%),linear-gradient(0deg, var(--Color-Neutral-Grey-50, #F6F6F6), var(--Color-Neutral-Grey-50, #F6F6F6))`
					: `radial-gradient(15.03% 60.19% at 45.64% 100%, rgba(205, 184, 140, 0.6) 0%, rgba(151, 102, 0, 0) 100%), radial-gradient(100% 141.54% at 100% 0%, rgba(176, 177, 177, 0.3) 0%, rgba(55, 58, 58, 0.3) 100%), linear-gradient(0deg, #1E1E1E, #1E1E1E)`,
				backgroundSize: '200% 200%',
				backgroundPosition: '0% 100%',
				transition: disabled ? 'none' : 'background-position 2s ease-in-out',

				_hover: disabled
					? {}
					: {
							backgroundPosition: '90% 100%',
							transition: 'background-position 2s ease-in-out, transform 0.2s ease-out',
					  },

				_active: disabled
					? {}
					: {
							background: colors.font.primary,
					  },

				_focus: {
					boxShadow: disabled ? 'none' : shadow['focus-button'],
				},
			};
		},
		superSecondary: (props: StyleFunctionProps) => {
			const disabled = props.isDisabled || props.disabled || props.isLoading;

			return {
				color: disabled ? colors.grey[50] : colors.whites.offwhite,
				cursor: disabled ? 'not-allowed' : 'pointer',

				background: disabled
					? 'radial-gradient(95.81% 135.6% at 100% 0%, rgba(255, 255, 255, 0.99) 0%,rgb(175, 250, 140) 100%)'
					: 'radial-gradient(35.81% 85.6% at 40% 30%, rgba(169, 250, 176, 0.81) 0%,rgb(0, 183, 104) 100%)',
				backgroundSize: '300% 300%',
				backgroundPosition: '0% 90%',
				transition: disabled ? 'none' : 'background-position 2s ease-in-out',

				_hover: disabled
					? {}
					: {
							backgroundPosition: '100% 0%',
							transition: 'background-position 2s ease-in-out, transform 0.2s ease-out',
					  },

				_active: disabled
					? {}
					: {
							background: 'radial-gradient(35.81% 85.6% at 40% 30%, rgba(122, 208, 129, 0.81) 0%,rgb(0, 139, 79) 100%)',
					  },

				_focus: {
					boxShadow: disabled ? 'none' : shadow['focus-button'],
				},
			};
		},
		primary: (props: StyleFunctionProps) => {
			const disabled = props.isDisabled || props.disabled || props.isLoading;
			return {
				color: disabled ? colors.grey[300] : colors.font.white,
				background: disabled ? colors.grey[100] : darkThemeColors.green.primary600,
				_dark: {
					background: disabled ? darkThemeColors.green.primary200 : darkThemeColors.green.primary700,
					_hover: {
						bg: disabled ? `${colors.green[100]} !important` : darkThemeColors.green.primary600,
					},
				},
				border: disabled ? `none` : `1px solid rgba(120, 241, 201, 0.67)`,
				_hover: {
					bg: disabled ? `${colors.grey[100]} !important` : darkThemeColors.green.primary500,
				},
				_active: {
					bg: disabled ? colors.grey[200] : colors.grey[800],
				},
				_focus: {
					boxShadow: disabled ? 'none' : shadow['focus-button'],
				},
				cursor: disabled ? 'not-allowed' : 'pointer',
			};
		},
		secondary: (props: StyleFunctionProps) => {
			const disabled = props.isDisabled || props.disabled || props.isLoading;
			return {
				color: disabled ? colors.grey[300] : colors.font.primary,
				background: disabled ? colors.grey[100] : colors.font.white,
				border: disabled ? `none` : `1px solid #E7E7E7`,
				_hover: {
					bg: disabled ? `${colors.grey[100]} !important` : colors.grey[100],
				},
				_active: {
					bg: disabled ? colors.grey[200] : '#E7E7E7',
				},
				_focus: {
					boxShadow: disabled ? 'none' : shadow['focus-button'],
				},
				cursor: disabled ? 'not-allowed' : 'pointer',
			};
		},
		ghost: (props: StyleFunctionProps) => {
			const disabled = props.isDisabled || props.disabled || props.isLoading;
			return {
				color: disabled ? colors.grey[300] : colors.font.primary,
				cursor: disabled ? 'not-allowed' : 'pointer',
				background: 'transparent',
				_hover: {
					border: 'none',
					bg: 'transparent',
				},
				_active: {
					bg: 'none',
				},
				_focus: {
					bg: 'none',
					boxShadow: 'none',
				},
			};
		},

		link: (props: StyleFunctionProps) => {
			const disabled = props.isDisabled || props.disabled || props.isLoading;
			return {
				color: disabled ? colors.grey[300] : colors.font.primary,
				cursor: disabled ? 'not-allowed' : 'pointer',
				background: 'transparent',
				_hover: {
					textDecoration: 'none',
					color: disabled ? colors.grey[300] : colors.whites.offwhite,
				},
			};
		},

		/**
		 * @see :
		 * - src/themeNew/components/menu.ts
		 * - src/components/Molecules/Inputs/SelectInput.tsx
		 */
		select: (props: StyleFunctionProps) => {
			const isPlaceholder = props['data-is-placeholder'];

			const { color, ...textStyle } = textStyles['body-md'];

			return {
				height: '48px',
				padding: 'p-sm',

				color: isPlaceholder ? colors.grey[300] : color,
				background: colors.font.white,

				borderWidth: '1px',
				borderStyle: 'solid',
				borderRadius: borderRadius.xs,
				borderColor: colors.grey[100],

				_hover: {
					borderColor: colors.grey[950],
				},
				_active: {
					borderColor: colors.grey[950],
				},
				_disabled: {
					background: colors.grey[50],
					color: colors.font.disabled,
					'& .chakra-button__icon': {
						color: colors.grey[400],
					},
					'& .chakra-divider': {
						borderColor: colors.grey[400],
					},
				},
				'& .chakra-button__icon': {
					color: colors.grey[950],
				},
				'& .chakra-divider': {
					borderColor: colors.grey[100],
				},
				...textStyle,
			};
		},
	},

	defaultProps: {
		variant: 'primary',
		size: 'md',
	},
};

export default Button;
