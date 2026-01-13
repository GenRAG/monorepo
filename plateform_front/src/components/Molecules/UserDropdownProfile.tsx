// components/UserProfileDropdown.tsx
import React from 'react';
import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuDivider,
	Avatar,
	Box,
	HStack,
	VStack,
	Text,
	Portal,
	Divider,
} from '@chakra-ui/react';
import { ChevronDown, User, Settings, HelpCircle, LogOut, Moon, Sun } from 'lucide-react';
import { useUserInfo } from 'hooks/useUserInfo';

interface UserProfileDropdownProps {
	onLogout?: () => void;
	onSettings?: () => void;
	onHelp?: () => void;
}

import { useColorMode } from '@chakra-ui/react';
import Button from 'components/Atoms/Button';

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
	onLogout,
	onSettings,
	onHelp,
}) => {
	const { name, email } = useUserInfo();
	const { colorMode, toggleColorMode } = useColorMode();


	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<Menu placement="top-end">
			{({ isOpen }) => (
				<>
					<MenuButton
						as={Box}
						cursor="pointer"
						transition="all 0.2s"
						_hover={{ bg: colorMode === 'dark' ? 'grey.700' : 'grey.100' }}
						borderRadius="24px"
						p={2}
					>
						<HStack>
							<Avatar size="sm" name={name} bg={colorMode === 'dark' ? 'grey.200' : 'grey.800'} color="white" />
							<VStack
								align="start"
								spacing={0}
								flex={1}
								display={{ base: 'none', md: 'flex' }}
							>
							</VStack>
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
						<MenuList
							zIndex="popover"
							minW="240px"
							m="0"
							bg={colorMode === 'dark' ? 'grey.800' : 'white'}
							borderColor={colorMode === 'dark' ? 'grey.700' : 'grey.200'}
						>
							<Box px={3} py={2}>
								<VStack align="start" spacing={1}>
									<Text
										fontSize="sm"
										color={colorMode === 'dark' ? 'grey.400' : 'grey.500'}
									>
										{email}
									</Text>
								</VStack>
							</Box>

							<Divider borderWidth="1px" mt="10px" borderColor={colorMode === 'dark' ? 'grey.700' : 'grey.100'} />
							<VStack w="100%">
							<Button
								variant="ghost"
								w="100%"
								fontSize="sm"
								borderRadius="md"
								py={2}
								gap={3}
								color={colorMode === 'dark' ? 'grey.300' : 'grey.700'}
								_hover={{ bg: colorMode === 'dark' ? 'grey.700' : 'grey.100' }}
							>
								View Profile
							</Button>

							<Button
								variant="ghost"
								w="100%"
								//icon={colorMode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
								fontSize="sm"
								onClick={toggleColorMode}
								borderRadius="md"
								py={2}
								gap={3}
								color={colorMode === 'dark' ? 'grey.300' : 'grey.700'}
								_hover={{ bg: colorMode === 'dark' ? 'grey.700' : 'grey.100' }}
							>
								{colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
							</Button>

							<Button
								variant="ghost"
								w="100%"
								//icon={<HelpCircle size={16} />}
								fontSize="sm"
								onClick={onHelp}
								borderRadius="md"
								py={2}
								gap={3}
								color={colorMode === 'dark' ? 'grey.300' : 'grey.700'}
								_hover={{ bg: colorMode === 'dark' ? 'grey.700' : 'grey.100' }}
							>
								Help & Support
							</Button>

							
							<Button
								//icon={<LogOut size={16} />}
								variant="ghost"
								w="100%"
								fontSize="sm"
								color="red.400"
								onClick={onLogout}
								borderRadius="md"
								gap={3}
								_hover={{ bg: colorMode === 'dark' ? 'red.900' : 'red.50' }}
							>
								Log out
							</Button>
							</VStack>
						</MenuList>
					</Portal>
				</>
			)}
		</Menu>
	);
};

export default UserProfileDropdown;