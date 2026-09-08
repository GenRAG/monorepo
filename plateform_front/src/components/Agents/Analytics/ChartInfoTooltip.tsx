import { Icon, Tooltip, type TooltipProps } from "@chakra-ui/react";
import { Info } from "lucide-react";

interface ChartInfoTooltipProps {
    label: React.ReactNode;
    placement?: TooltipProps["placement"];
}

export const ChartInfoTooltip = ({ label, placement = "top" }: ChartInfoTooltipProps) => (
    <Tooltip
        label={label}
        placement={placement}
        hasArrow
        bg="surfaceCard"
        color="textBody"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="borderDefault"
        borderRadius="10px"
        boxShadow="xl"
        p={3}
        maxW="280px"
        fontSize="xs"
        fontWeight="normal"
    >
        <Icon as={Info} boxSize={3.5} color="textFaint" cursor="pointer" flexShrink={0} />
    </Tooltip>
);
