import React, { PropsWithChildren } from 'react';
import { Menu, MenuButton, MenuList, Portal, Box, useColorMode, HStack, Text } from '@chakra-ui/react';

import Button, { RamifyButtonProps } from 'components/Atoms/Button';
import { ChevronDown } from 'lucide-react';


const MenuDropDown = React.forwardRef<HTMLButtonElement, PropsWithChildren<{ label: string } & RamifyButtonProps>>(
	({ label, children, variant = 'secondary', ...props }, ref: React.Ref<HTMLButtonElement>) => {
		const { colorMode } = useColorMode();
		return (
			<Menu matchWidth>
				{({ isOpen }) => (
					<>
						<MenuButton
							as={Button}
							variant={variant}
							ref={ref}
							m="0"
							p="4"
							iconProps={{
								transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
								transition: 'transform 0.2s ease-in-out',
							}}
							{...props}
						>
							<HStack justify="center" align="center" p="4">
								<Text flex="1" textAlign="left">
									{label}
								</Text>
								<Box
									as={ChevronDown}
									size={16}
									color={colorMode === 'dark' ? 'grey.400' : 'grey.500'}
									transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
									transition="transform 0.2s"
								/>
							</HStack>
						</MenuButton>
						<Portal>
							<MenuList p="0.5" zIndex="popover">{children}</MenuList>
						</Portal>
					</>
				)}
			</Menu>
		);
	},
);

export default MenuDropDown;