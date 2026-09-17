import { Divider, Stack, useColorModeValue, VStack } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import { DocPageHeader } from "components/Legal/DocPageHeader";
import { DocSectionRenderer } from "components/Legal/DocSectionRenderer";
import type { SectionData } from "pages/Legal/data/types";

interface LegalDocPageProps {
    badge: { icon: LucideIcon; label: string };
    title: string;
    description: string;
    date: string;
    readTime: string;
    scope?: string;
    sections: SectionData[];
}

export const LegalDocPage = ({ badge, title, description, date, readTime, scope, sections }: LegalDocPageProps) => {
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <VStack align="start" maxW="780px" mx="auto" px={8} py={8}>
            <DocPageHeader
                badge={badge}
                title={title}
                description={description}
                date={date}
                readTime={readTime}
                scope={scope}
            />
            <Stack spacing={10} w="full">
                {sections.map((section, idx) => (
                    <VStack key={section.id} align="start" spacing={10} w="full">
                        <DocSectionRenderer section={section} />
                        {idx < sections.length - 1 && <Divider borderColor={borderColor} />}
                    </VStack>
                ))}
            </Stack>
        </VStack>
    );
};
