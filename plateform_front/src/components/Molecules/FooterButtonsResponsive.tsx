import { HStack } from "@chakra-ui/react";

import Button, { RamifyButtonProps } from "components/Atoms/Button";

export type FooterResponsiveProps = {
    buttons?: RamifyButtonProps[];
};

const FooterButtonsResponsive = ({ buttons }: FooterResponsiveProps) => (
    <HStack
        w="100%"
        justify={buttons?.length == 1 ? "end" : "space-between"}
        spacing="8px"
    >
        {buttons?.map((button, index) => (
            <Button key={index} {...button}>
                {button.children}
            </Button>
        ))}
    </HStack>
);
export default FooterButtonsResponsive;
