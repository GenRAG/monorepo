import { progressAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(progressAnatomy.keys);

// Important to use backgroundColor and not bg, to enable stripes
const Progress = defineMultiStyleConfig({
	baseStyle: {
		track: {
			borderRadius: 'full',
			backgroundColor: 'gold.100',
		},
		filledTrack: {
			backgroundColor: 'gold.300',
		},
	},
	defaultProps: {
		size: 'xs',
	},
});

export default Progress;
