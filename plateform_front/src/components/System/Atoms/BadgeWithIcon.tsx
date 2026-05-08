import {
    Badge,
    BadgeProps,
    HStack,
    Icon,
    IconProps,
    Image,
} from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";

import CustomTooltip from "./CustomTooltip";

export type BadgeWithIconProps = {
    icon?: string | LucideIcon;
    title: string | number;
    tooltip?: string;
    iconProps?: IconProps;
} & Omit<BadgeProps, "title">;

const BadgeWithIcon = ({
    icon,
    title,
    iconProps,
    children,
    ...props
}: BadgeWithIconProps) => (
    <Badge
        _hover={
            props.onClick
                ? {
                      cursor: "pointer",
                  }
                : undefined
        }
        borderWidth="1px"
        borderColor="transparent"
        {...props}
    >
        <HStack align="center" spacing="4px">
            {icon &&
                (typeof icon === "string" ? (
                    <Image src={icon} boxSize="16px" />
                ) : (
                    <Icon as={icon} size="16px" {...iconProps} />
                ))}
            <>{title}</>
            {props.tooltip && <CustomTooltip text={props.tooltip} />}
            {children}
        </HStack>
    </Badge>
);

export default BadgeWithIcon;
