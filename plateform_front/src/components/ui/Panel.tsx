import { StackProps, VStack } from "@chakra-ui/react";

/** Carte de page posée sur le fond : surface pleine, bordure discrète. */
export const Panel = (props: StackProps) => (
    <VStack
        align="stretch"
        bg="surfacePrimary"
        borderRadius="10px"
        border="1px solid"
        borderColor="borderSubtle"
        {...props}
    />
);
