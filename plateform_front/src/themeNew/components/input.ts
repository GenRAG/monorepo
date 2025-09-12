import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

import borderRadius from 'themeNew/foundations/borderRadius';
import colors from 'themeNew/foundations/colors';
import { textStyles } from 'themeNew/foundations/typography';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys);

const baseStyle = definePartsStyle({
	field: {
		...textStyles?.['body-md'],
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: borderRadius.xs,
		borderColor: colors.grey[100],
		_hover: {
			borderColor: colors.grey[950],
		},
		_disabled: {
			bg: colors.grey[50],
			color: colors.font.info,
		},
		_placeholder: {
			color: colors.font.info,
		},
	},
});

const Input = defineMultiStyleConfig({
	baseStyle,
	variants: {
		default: {
			...baseStyle,
		},
	},
	sizes: {
		lg: {
			field: {
				height: '56px',
			},
		},
		md: {
			field: {
				height: '48px',
			},
		},
		sm: {
			field: {
				height: '40px',
			},
		},
		xs: {
			field: {
				height: '32px',
			},
		},
	},
	defaultProps: {
		size: 'md',
		variant: 'default', // Chakra ui applie un variant "outline" par défaut donc on l'override
	},
});

export default Input;
