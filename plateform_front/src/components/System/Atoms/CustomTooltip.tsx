import React, { FC } from "react";
import {
    Box,
    Icon,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverProps,
    PopoverTrigger,
    Portal,
    PropsOf,
    Text,
} from "@chakra-ui/react";
import { Info } from "lucide-react";

const CustomTooltip: FC<
    {
        text?: React.ReactNode;
        content?: React.ReactNode;
        color?: PropsOf<typeof Icon>["color"];
    } & PopoverProps
> = ({ text, content, color = "inherit", ...props }) => (
    <Popover placement="auto" trigger="hover" {...props}>
        {({ isOpen }) => (
            <>
                <PopoverTrigger>
                    <Icon
                        as={Info}
                        style={{
                            margin: "0 0.25em",
                            display: "inline",
                            verticalAlign: "middle",
                            minWidth: "16px",
                            minHeight: "16px",
                            strokeWidth: "1.5px",
                            cursor: "pointer",
                        }}
                        color={isOpen ? "grey.500" : color}
                    />
                </PopoverTrigger>
                {(text || content) && isOpen && (
                    <Portal>
                        <Box zIndex="popover" position="relative">
                            <PopoverContent p="16px" maxW="88vw" bg="grey.900" border="0" borderRadius="4px">
                                <PopoverArrow bg="grey.900" shadow="none" />
                                <PopoverBody p="0">
                                    <Text as="span" color="red">
                                        {text}
                                    </Text>
                                    {content}
                                </PopoverBody>
                            </PopoverContent>
                        </Box>
                    </Portal>
                )}
            </>
        )}
    </Popover>
);

export default CustomTooltip;
