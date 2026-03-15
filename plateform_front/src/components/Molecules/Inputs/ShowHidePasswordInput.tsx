import React, { JSX, RefObject, useCallback, useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import {
    Box,
    Divider,
    Input,
    InputGroup,
    InputProps,
    InputRightElement,
} from "@chakra-ui/react";

export const ShowHidePasswordInput = React.forwardRef<
    HTMLInputElement,
    InputProps
>((props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    return (
        <InputGroup>
            <Input
                {...props}
                ref={ref}
                type={showPassword ? "text" : "password"}
            />
            <InputRightElement
                display="flex"
                alignItems="center"
                height="100%"
                gap={2}
            >
                <Divider
                    orientation="vertical"
                    height="60%"
                    borderColor="grey.300"
                />
                <Box onClick={toggleShowPassword} cursor="pointer">
                    {showPassword ? <Eye size="20" /> : <EyeClosed size="20" />}
                </Box>
            </InputRightElement>
        </InputGroup>
    );
});

ShowHidePasswordInput.displayName = "ShowHidePasswordInput";
