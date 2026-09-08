import { HStack, StackProps } from "@chakra-ui/react";

const CardHeader = ({ children, ...props }: StackProps) => (
    <HStack justify="space-between" borderBottom="1px solid" borderColor="borderDefault" p={4} {...props}>
        {children}
    </HStack>
);

export default CardHeader;
