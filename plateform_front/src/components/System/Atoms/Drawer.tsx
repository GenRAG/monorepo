import { ReactNode, useState } from "react";
import {
    Box,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerProps,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Override } from "types/utils";

import FooterButtonsResponsive from "components/System/Molecules/FooterButtonsResponsive";
import { useAppResponsive } from "hooks/useAppResponsive";

import { GenragButtonProps } from "./Button";

const MotionBox = motion(Box);
const MotionOverlay = motion(DrawerOverlay);

type DrawerPropsCustom = Override<
    DrawerProps,
    {
        header: string | ReactNode;
        ctas?: GenragButtonProps[];
    }
>;

const ResponsiveDrawer = ({
    isOpen,
    onClose,
    header,
    ctas,
    children,
    ...props
}: DrawerPropsCustom) => {
    const isDesktop = useAppResponsive({ base: false, md: true });
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 10);
    };

    const footerDrawer = ctas && ctas.length > 0 && (
        <DrawerFooter>
            <FooterButtonsResponsive buttons={ctas} />
        </DrawerFooter>
    );

    const headerDrawer = (
        <DrawerHeader onClick={handleClose}>
            {header}
            <DrawerCloseButton />
        </DrawerHeader>
    );

    return (
        <Drawer
            placement={isDesktop ? "right" : "bottom"}
            size="lg"
            trapFocus={false}
            isOpen={isOpen}
            onClose={handleClose}
            {...props}
        >
            <DrawerOverlay />
            {isDesktop ? (
                <DrawerContent bg="whites.white" overflow="hidden">
                    {headerDrawer && headerDrawer}
                    <DrawerBody>{children}</DrawerBody>

                    {footerDrawer && footerDrawer}
                </DrawerContent>
            ) : (
                <AnimatePresence>
                    {(isOpen || isClosing) && (
                        <>
                            <MotionOverlay
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                            <DrawerContent bg="transparent" overflow="hidden">
                                <MotionBox
                                    bg="whites.white"
                                    borderTopRadius="xl"
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeInOut",
                                    }}
                                    drag={isDesktop ? false : "y"}
                                    dragConstraints={{ top: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, info) => {
                                        if (info.offset.y > 60) {
                                            handleClose();
                                        }
                                    }}
                                >
                                    {headerDrawer && headerDrawer}

                                    <DrawerBody
                                        overflowY="auto"
                                        maxH="calc(100vh - 200px)"
                                    >
                                        {children}
                                    </DrawerBody>

                                    {footerDrawer && footerDrawer}
                                </MotionBox>
                            </DrawerContent>
                        </>
                    )}
                </AnimatePresence>
            )}
        </Drawer>
    );
};

export default ResponsiveDrawer;
