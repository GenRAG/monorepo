import { Flex } from "@chakra-ui/react";
import { WelcomeCollage } from "./WelcomeCollage";

/** Visuel de l'écran de bienvenue : les démos animées du site vitrine. */
export const WelcomeStage = () => (
    <Flex
        flex={1}
        minW={0}
        align="center"
        justify="center"
        overflow="hidden"
        display={{ base: "none", lg: "flex" }}
        backgroundImage="radial-gradient(760px circle at 50% 46%, rgba(18, 185, 140, 0.16), transparent 70%)"
    >
        <WelcomeCollage />
    </Flex>
);
