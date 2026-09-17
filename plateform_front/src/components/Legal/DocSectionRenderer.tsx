import { VStack, Text } from "@chakra-ui/react";
import { DocSection } from "./DocSection";
import { DocBulletList } from "./DocBulletList";
import { DocInfoBox } from "./DocInfoBox";
import { DocTable } from "./DocTable";
import type { SectionData } from "pages/Legal/data/types";

const SubpartBlock = ({ title, items }: { title: string; items: string[] }) => {
    return (
        <VStack align="start" spacing={2.5} w="full">
            <Text fontSize="sm" fontWeight={700} color="textPrimary">
                {title}
            </Text>
            <DocBulletList items={items} />
        </VStack>
    );
};

interface Props {
    section: SectionData;
}

export const DocSectionRenderer = ({ section }: Props) => {
    return (
        <DocSection number={section.number} title={section.title} id={section.id}>
            <VStack align="start" spacing={4} w="full">
                {section.intro && (
                    <Text fontSize="sm" color="textDescription" lineHeight={1.7}>
                        {section.intro}
                    </Text>
                )}
                {section.text && (
                    <Text fontSize="sm" color="textDescription" lineHeight={1.7}>
                        {section.text}
                    </Text>
                )}
                {section.bullets && <DocBulletList items={section.bullets} />}
                {section.subparts?.map((sub, i) => (
                    <SubpartBlock key={i} title={sub.title} items={sub.items} />
                ))}
                {section.table && <DocTable rows={section.table} />}
                {section.infoBox && <DocInfoBox>{section.infoBox}</DocInfoBox>}
            </VStack>
        </DocSection>
    );
};
