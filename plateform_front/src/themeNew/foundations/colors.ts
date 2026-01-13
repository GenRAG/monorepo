/**
 * Only use hex or rgba values in baseColors
 */
const baseColors = {
	whites: {
		white: '#FFFFFF',
		transparent: 'rgba(255, 255, 255, 0)',
		lightwhite: 'rgba(255, 255, 255, 0.08)',
		semiwhite: 'rgba(255, 255, 255, 0.5)',
		offwhite: '#FAFAFA',
		offwhiteBlur: 'rgba(250, 250, 250, 0.8)',
	},

	gold: {
		50: '#FDF8EF',
		100: '#F5E5CE',
		200: '#F6DCB2',
		300: '#EFC27E',
		400: '#E8A24F',
		500: '#E3882C',
		600: '#D46F22',
		700: '#B0561E',
		800: '#8D451F',
		900: '#723A1C',
		950: '#3D1B0D',
	},

	grey: {
		50: '#F6F6F6',
		100: '#E7E7E7',
		200: '#D1D1D1',
		300: '#B0B0B0',
		400: '#8F8F8F',
		500: '#6D6D6D',
		600: '#5D5D5D',
		700: '#4F4F4F',
		800: '#3D3D3D',
		900: '#262626',
		950: '#1E1E1E',
	},

	// sucess
	green: {
		50: '#ECFDF9',
		100: '#D1FAEF',
		200: '#A8F3DF',
		300: '#6EE7C7',
		400: '#34D3A9',
		500: '#12B98C',
		600: '#07966F',
		700: '#047859',
		800: '#076048',
		900: '#064E3B',
		950: '#012C21',
	},

	// error
	red: {
		50: '#FEF2F2',
		100: '#FEE2E1',
		200: '#FECACB',
		300: '#FDA4A5',
		400: '#F97071',
		500: '#EF4345',
		600: '#DE2427',
		700: '#BA1C1D',
		800: '#9A191B',
		900: '#7F1C1D',
		950: '#450A0B',
	},

	// information
	blue: {
		50: '#EBF5FF',
		100: '#DBECFF',
		200: '#BFDBFF',
		300: '#96C2FF',
		400: '#6D9EFF',
		500: '#4A79FF',
		600: '#2B50FF',
		700: '#1F3DE3',
		800: '#1F3DE3',
		900: '#1C2E7D',
		950: '#121E53',
	},

	// genrag green
	olive: {
		50: '#F4F6EF',
		100: '#E6EBDC',
		200: '#D0D9BD',
		300: '#B2C096',
		400: '#95A873',
		500: '#768A55',
		600: '#5D6E42',
		700: '#495635',
		800: '#3B462E',
		900: '#343D2A',
		950: '#1A2013',
	},

	liquidGlass: {
		success: 'rgba(72, 187, 120, 1)',
		error: 'rgba(229, 62, 62, 1)',
		warning: 'rgba(236, 201, 75, 0.99)',
		info: 'rgba(66, 153, 225, 1)',      
		favorite: 'rgba(246, 174, 85, 1)',  
		default: 'rgba(255, 255, 255, 1)',
	},

	gradients: {
		ESSENTIAL: 'linear-gradient(180deg, #D8D7D7 -0.11%, #F6F6F6 100%)',
		FLAGSHIP: 'linear-gradient(180deg, #726F6B -0.1%, #989591 99.99%)',
		ELITE: 'linear-gradient(0deg, #B59C76 2.32%, #98743F 99.87%)',

		premier: 'radial-gradient(124.26% 81.24% at 79.69% 34.2%, #FFF 0%, #E4E4E4 42%, #B0B0B0 100%)',
		black: 'radial-gradient(124.26% 81.24% at 79.69% 34.2%, #A38556 0%, #38322A 42%,  #1E1E1E 100%)',
		obsidian: 'radial-gradient(124.26% 81.24% at 79.69% 34.2%, #988ED5 0%, #281986 42.31%, #0A052A 100%)',

		gold: 'radial-gradient(152.96% 100% at 100% 50%, rgba(239, 235, 229, 0.40) 0%, rgba(234, 214, 187, 0.40) 75%, rgba(220, 189, 145, 0.40) 100%), rgba(230, 181, 103, 0.90)',
	},
};

export default {
	font: {
		primary: 'textPrimary',
		secondary: baseColors.grey[800],
		tertiary: baseColors.grey[500],
		info: baseColors.grey[400],
		disabled: baseColors.grey[300],
		white: baseColors.whites.white,
	},

	content: {
		black: baseColors.grey[900],
		gold: baseColors.gold[300],
	},

	...baseColors,
};
