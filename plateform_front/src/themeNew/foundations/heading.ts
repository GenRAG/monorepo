import { baseHeadingStyle, headingStyles } from 'themeNew/foundations/typography';

const Heading = {
	baseStyle: {
		...baseHeadingStyle,
	},
	// Heading component in chakra doesn't support responsive fontSize
	// xl: {
	//   fontSize: { xl: '30px', base: '24px' },
	// } -> this is not supported
	// so we define responsive fontsize at css level
	variants: {
		...headingStyles,
	},
	defaultProps: {
		variant: 'heading-md',
	},
};
export default Heading;
