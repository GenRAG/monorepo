import Banner from "components/ui/Banner";
import type { ReactNode } from "react";

interface DocInfoBoxProps {
    children: ReactNode;
}

export const DocInfoBox = ({ children }: DocInfoBoxProps) => {
    return (
        <Banner bg="accentCardBg" borderColor="borderAccentCardMuted" color="bubbleAccentText" variant="green" w="full">
            {children}
        </Banner>
    );
};
