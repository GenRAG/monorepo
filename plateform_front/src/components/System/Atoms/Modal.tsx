import { FC, PropsWithChildren } from "react";
import {
    CloseButtonProps,
    Divider,
    Modal as ChakraModal,
    ModalBody,
    ModalBodyProps,
    ModalCloseButton,
    ModalContent,
    ModalContentProps,
    ModalFooter,
    ModalFooterProps,
    ModalHeader,
    ModalHeaderProps,
    ModalOverlay,
    ModalProps,
} from "@chakra-ui/react";

import { useAppResponsive } from "hooks/useAppResponsive";
import { isNotNone } from "utils/isNotNone";

export type CustomModalProps = ModalProps &
    PropsWithChildren<{
        contentProps?: ModalContentProps;
        bodyProps?: ModalBodyProps;
        closeButtonProps?: CloseButtonProps;
        headersProps?: ModalHeaderProps;
        footerProps?: ModalFooterProps;
        hasDividers?: boolean;
    }>;

const Modal: FC<CustomModalProps> = ({
    children,
    contentProps,
    bodyProps,
    closeButtonProps,
    headersProps,
    footerProps,
    hasDividers = true,
    ...props
}) => {
    const size = useAppResponsive({
        base: "xs",
        sm: "sm",
        md: "md",
        lg: "lg",
        xl: "xl",
    });

    return (
        <ChakraModal size={size} {...props}>
            <ModalOverlay />
            <ModalContent {...contentProps}>
                <ModalHeader {...headersProps} />
                <ModalCloseButton
                    _focusVisible={{
                        boxShadow: "hidden",
                    }}
                    {...closeButtonProps}
                />
                {hasDividers && isNotNone(headersProps) && (
                    <Divider borderColor="grey.100" />
                )}
                <ModalBody {...bodyProps}>{children}</ModalBody>
                {hasDividers && isNotNone(footerProps) && (
                    <Divider borderColor="grey.100" />
                )}
                <ModalFooter {...footerProps} />
            </ModalContent>
        </ChakraModal>
    );
};

export default Modal;
