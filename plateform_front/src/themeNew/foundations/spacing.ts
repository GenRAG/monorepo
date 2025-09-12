// By default, use padding spacing as default spacing values
// will apply on :
// spacing="md"
// gap="xl"
// padding="sm"
// ....
const spacing = {
	'2xs': 'var(--genrag-p-spacing-2xs)',
	xs: 'var(--genrag-p-spacing-xs)',
	sm: 'var(--genrag-p-spacing-sm)',
	md: 'var(--genrag-p-spacing-md)',
	lg: 'var(--genrag-p-spacing-lg)',
	xl: 'var(--genrag-p-spacing-xl)',
};

const prefixList = ['p', 'h', 'v']; // for padding / horizontal / vertical
const responsiveList = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl'];
const customsToken = prefixList
	.map((prefix) =>
		Object.fromEntries(responsiveList.map((size) => [`${prefix}-${size}`, `var(--genrag-${prefix}-spacing-${size})`])),
	)
	.reduce((acc, curr) => ({ ...acc, ...curr }), {});

export { customsToken, spacing };
