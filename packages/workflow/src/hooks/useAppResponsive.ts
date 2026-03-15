import { ResponsiveObject, useBreakpointValue } from "@chakra-ui/react";

export const useAppResponsive = <P extends ResponsiveObject<T>, T = P[keyof P]>(
    values: P,
) =>
    useBreakpointValue(values, { ssr: false }) as "base" extends keyof P
        ? T
        : T | undefined;
