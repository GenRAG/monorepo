import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, UploadCloud } from "lucide-react";
import { DEMO_EASE, DEMO_SPRING, DemoCard } from "components/ui/demo/DemoStage";

const FILES = [
    { name: "guide_rh.pdf", size: "2,4 Mo" },
    { name: "grille_tarifs.docx", size: "860 Ko" },
    { name: "faq_produit.txt", size: "42 Ko" },
];

export const FileStackChip = () => (
    <Box position="relative">
        {[2, 1].map((i) => (
            <Box
                key={i}
                position="absolute"
                inset={0}
                transform={`translate(${i * 3}px, ${i * 3}px)`}
                bg="surfaceAction"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="borderDivider"
                borderRadius="8px"
            />
        ))}
        <HStack
            position="relative"
            spacing={1.5}
            px={2}
            py={1.5}
            bg="surfaceAction"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="borderAccentCardActive"
            borderRadius="8px"
            boxShadow="0 8px 20px rgba(0,0,0,0.15)"
        >
            <Icon as={FileText} boxSize="12px" color="iconAccent" />
            <Text variant="body-2xs-semibold" color="textPrimary" whiteSpace="nowrap">
                3 fichiers
            </Text>
        </HStack>
    </Box>
);

export const DocumentUpload = ({ dropActive, dropped }: { dropActive: boolean; dropped: boolean }) => (
    <VStack h="100%" spacing={2} justify="flex-start" align="stretch" pt={2}>
        <Box
            data-demo="dropzone"
            h={dropped ? "48px" : "150px"}
            display="flex"
            flexDirection={dropped ? "row" : "column"}
            gap={2}
            alignItems="center"
            justifyContent="center"
            borderWidth="1.5px"
            borderStyle="dashed"
            borderColor={dropActive ? "iconAccent" : "borderStrong"}
            borderRadius="12px"
            bg={dropActive ? "accentCardBg" : "transparent"}
            transform={dropActive ? "scale(1.02)" : "scale(1)"}
            transition="all 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
        >
            <Icon
                as={UploadCloud}
                boxSize={dropped ? "16px" : "22px"}
                color={dropActive ? "iconAccent" : "textMuted"}
            />
            <Text variant="body-2xs" color="textLabel">
                {dropActive ? "Relâchez pour importer" : "Glissez-déposez vos documents"}
            </Text>
        </Box>

        <AnimatePresence>
            {dropped &&
                FILES.map((file, i) => (
                    <motion.div
                        key={file.name}
                        initial={{ opacity: 0, y: -10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ ...DEMO_SPRING, delay: 0.1 + i * 0.12 }}
                    >
                        <FileRow {...file} delay={0.3 + i * 0.35} />
                    </motion.div>
                ))}
        </AnimatePresence>
    </VStack>
);

const FileRow = ({ name, size, delay }: { name: string; size: string; delay: number }) => (
    <DemoCard px={2.5} h="32px" display="flex" alignItems="center">
        <HStack w="100%" spacing={2}>
            <Icon as={FileText} boxSize="13px" color="iconAccent" />
            <Text variant="body-2xs-semibold" color="textPrimary" flex={1} noOfLines={1}>
                {name}
            </Text>
            <Text variant="body-2xs-muted">{size}</Text>
            <Box w="54px" h="4px" borderRadius="999px" bg="dotInactive" overflow="hidden">
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, delay, ease: DEMO_EASE }}
                    style={{
                        height: "100%",
                        transformOrigin: "left",
                        background: "var(--chakra-colors-iconAccent)",
                    }}
                />
            </Box>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...DEMO_SPRING, delay: delay + 0.9 }}
            >
                <Icon as={Check} boxSize="12px" color="iconAccent" display="block" />
            </motion.div>
        </HStack>
    </DemoCard>
);
