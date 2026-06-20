import { Circle } from "@chakra-ui/react";

const CircledFrame = ({ children, ...props }: { children: React.ReactNode } & React.ComponentProps<typeof Circle>) => (
    <Circle
        size={{ base: "32px", xl: "40px" }}
        bg="whites.white"
        borderWidth="1px"
        borderColor="grey.100"
        children={children}
        {...props}
    />
);
export default CircledFrame;
