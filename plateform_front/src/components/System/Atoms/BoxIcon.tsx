import { Box, Icon, Text } from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";

const BoxIcon = ({
    icon,
    letters,
    color = "green.500",
    bg = "accentIconBg",
    size = "md",
}: {
    icon?: LucideIcon;
    letters?: string;
    color?: string;
    bg?: string;
    size?: "sm" | "md";
}) => {
    return (
        <Box
            w={size === "sm" ? "28px" : "36px"}
            h={size === "sm" ? "28px" : "36px"}
            borderRadius="8px"
            bg={bg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
        >
            {icon ? (
                <Icon as={icon} boxSize="16px" color={color} />
            ) : letters ? (
                <Text fontSize="12px" fontWeight="bold" color={color} textTransform="uppercase" lineHeight="1">
                    {letters}
                </Text>
            ) : null}
        </Box>
    );
};

export default BoxIcon;
