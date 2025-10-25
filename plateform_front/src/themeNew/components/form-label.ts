import colors from 'themeNew/foundations/colors';
import { textStyles } from 'themeNew/foundations/typography';

import Text from '../foundations/text';

const FormLabel = {
	baseStyle: {
		...textStyles['body-sm'],
		marginEnd: 0,
		color: colors.font.tertiary,
		_invalid: {
			color: colors.red[700],
		},
	},

	variants: Text.variants,
};

export default FormLabel;
