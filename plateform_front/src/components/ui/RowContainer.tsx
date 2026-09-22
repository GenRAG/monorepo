import { HStack, type StackProps } from "@chakra-ui/react";
import { ReactNode } from "react";

interface RowContainerProps extends StackProps {
    children: ReactNode;
    withBorder?: boolean;
}

const RowContainer = ({ children, withBorder = true, ...props }: RowContainerProps) => {
    return (
        <HStack
            spacing={3}
            p={2}
            borderBottom={withBorder ? "1px solid" : "none"}
            borderColor="borderDefault"
            _hover={{ bg: "surfaceSubtle" }}
            _last={{ borderBottom: "none", borderBottomRadius: "8px" }}
            transition="background 0.1s"
            {...props}
        >
            {children}
        </HStack>
    );
};

export default RowContainer;
