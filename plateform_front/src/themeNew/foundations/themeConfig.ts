export const DARK_THEME_ACCENT = 'green' as 'orange' | 'green' | 'blue';

export const darkThemeColors = {
	orange: {
		primary: 'orange.400',
		primary500: 'orange.500',
		primary900: 'orange.900',
		rgba: {
			primary: 'rgba(251, 146, 60, 1)',
			primary20: 'rgba(251, 146, 60, 0.2)',
			primary30: 'rgba(251, 146, 60, 0.3)',
		},
		completeColor: 'rgba(251, 146, 60, 0.6)',
		hex: {
			primary: '#fb923c',
		},
		colorScheme: 'orange',
	},
	green: {
		primary: 'green.400',
		primary100: 'green.100',
		primary200: 'green.200',
		primary300: 'green.300',
		primary400: 'green.400',
		primary500: 'green.500',
		primary600: 'green.600',
		primary700: 'green.700',
		primary800: 'green.800',
		primary900: 'green.900',
		rgba: {
			primary: 'rgba(52, 211, 169, 1)',
			primary20: 'rgba(52, 211, 169, 0.2)',
			primary30: 'rgba(52, 211, 169, 0.3)',
		},
		completeColor: 'rgba(52, 211, 168, 0.33)',
		hex: {
			primary: '#34D3A9',
		},
		colorScheme: 'green',
	},
	blue: {
		primary: 'blue.400',
		primary500: 'blue.500',
		primary900: 'blue.900',
		rgba: {
			primary: 'rgba(109, 158, 255, 1)',
			primary20: 'rgba(109, 158, 255, 0.2)',
			primary30: 'rgba(109, 158, 255, 0.3)',
		},
		completeColor: 'rgba(109, 158, 255, 0.6)',
		hex: {
			primary: '#6D9EFF',
		},
		colorScheme: 'blue',
	},
} as const;

// Couleur actuelle basée sur la configuration
export const currentDarkTheme = darkThemeColors[DARK_THEME_ACCENT];

