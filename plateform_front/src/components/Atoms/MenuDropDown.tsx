import React, { PropsWithChildren } from 'react';
import { Menu, MenuButton, MenuList, Portal } from '@chakra-ui/react';

import Button, { RamifyButtonProps } from 'components/Atoms/Button';

const MenuDropDown = React.forwardRef<HTMLButtonElement, PropsWithChildren<{ label: string } & RamifyButtonProps>>(
	({ label, children, variant = 'secondary', ...props }, ref: React.Ref<HTMLButtonElement>) => (
		<Menu>
			{({ isOpen }) => (
				<>
					<MenuButton
						as={Button}
						variant={variant}
						ref={ref}
						iconProps={{
							transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
							transition: 'transform 0.2s ease-in-out',
						}}
						{...props}
					>
						{label}
					</MenuButton>
					<Portal>
						<MenuList zIndex="popover">{children}</MenuList>
					</Portal>
				</>
			)}
		</Menu>
	),
);

export default MenuDropDown;
