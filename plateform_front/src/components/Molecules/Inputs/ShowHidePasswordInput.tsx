import React, { JSX, LegacyRef, useCallback, useState } from 'react';
import { Eye, EyeClosed } from 'lucide-react';
import { Box, Divider, Input, InputGroup, InputProps, InputRightElement } from '@chakra-ui/react';

export const ShowHidePasswordInput = React.forwardRef(
	(props: InputProps, ref: LegacyRef<HTMLInputElement>): JSX.Element => {
		const [showPassword, setShowPassword] = useState(false);

		const toggleShowPassword = useCallback(() => {
			setShowPassword((prev) => !prev);
		}, []);

		return (
			<InputGroup>
				<Input {...props} ref={ref} type={showPassword ? 'text' : 'password'} />
				<InputRightElement display="flex" alignItems="center" height="100%" gap={2}>
					<Divider orientation="vertical" height="60%" borderColor="grey.300" />
					<Box onClick={toggleShowPassword} cursor="pointer">
						{showPassword ? <Eye size="20" /> : <EyeClosed size="20" />}
					</Box>
				</InputRightElement>
			</InputGroup>
		);
	},
);
