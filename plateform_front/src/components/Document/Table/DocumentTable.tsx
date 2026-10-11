import React from "react";
import { Box, HStack, Icon, Table, Tbody, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { Plus, Search } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import { DocumentEntity } from "types/document/document";
import { DocumentRow } from "./DocumentRow";
import { DocumentSkeletonRow } from "./DocumentSkeletonRow";
import { DocumentTableHeader } from "./DocumentTableHeader";
import { DocumentSourceSection } from "./DocumentSourceSection";
import { useDatasetChartPalette } from "components/Dataset/Analytics/datasetChartPalette";
import { DOCUMENT_SOURCE_LABELS, DOCUMENT_SOURCES } from "utils/dataset/documentSource";
import { DocumentSource } from "types/dataset/dataset";

const COLUMN_COUNT = 6;

interface DocumentTableProps {
    documents: DocumentEntity[];
    isLoading: boolean;
    onPreview: (document: DocumentEntity) => void;
    onDelete: (documentId: string) => void;
    onRetry?: (documentId: string) => void;
    onDownload: (documentId: string) => void;
    onUpload?: () => void;
    footer?: React.ReactNode;
    /** One section per source; documents arrive ordered by source from the API. */
    groupBySource?: boolean;
    /** Documents per source in the whole dataset (the section headers show them). */
    sourceCounts?: Partial<Record<DocumentSource, number>>;
}

/** Same frame as the agents and assistants tables. */
export const DocumentTable: React.FC<DocumentTableProps> = ({
    documents,
    isLoading,
    onPreview,
    onDelete,
    onRetry,
    onDownload,
    onUpload,
    footer,
    groupBySource = false,
    sourceCounts = {},
}) => {
    const palette = useDatasetChartPalette();
    // Alpha overlay: secondBackgroundDefault equals surfaceCard in dark mode, a token would hide the hover.
    const rowHoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

    return (
        <Box
            borderRadius="12px"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="borderDefault"
            bg="surfacePrimary"
            overflow="hidden"
        >
            {isLoading || documents.length > 0 ? (
                <Box overflowX="auto">
                    <Table size="sm" minW="720px">
                        <DocumentTableHeader />
                        <Tbody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => <DocumentSkeletonRow key={i} />)
                                : documents.map((doc, index) => {
                                      const source = doc.source ?? "UPLOAD";
                                      const startsSection =
                                          groupBySource &&
                                          (index === 0 || (documents[index - 1].source ?? "UPLOAD") !== source);
                                      return (
                                          <React.Fragment key={doc.id}>
                                              {startsSection && (
                                                  <DocumentSourceSection
                                                      label={DOCUMENT_SOURCE_LABELS[source]}
                                                      count={sourceCounts[source] ?? 0}
                                                      color={palette[DOCUMENT_SOURCES.indexOf(source)]}
                                                      colSpan={COLUMN_COUNT}
                                                  />
                                              )}
                                              <DocumentRow
                                                  document={doc}
                                                  hoverBg={rowHoverBg}
                                                  onPreview={() => onPreview(doc)}
                                                  onDelete={() => onDelete(doc.id)}
                                                  onRetry={onRetry ? () => onRetry(doc.id) : undefined}
                                                  onDownload={() => onDownload(doc.id)}
                                              />
                                          </React.Fragment>
                                      );
                                  })}
                        </Tbody>
                    </Table>
                </Box>
            ) : (
                <VStack py={10} spacing={2}>
                    <Icon as={Search} boxSize={8} color="textLabel" />
                    <Text fontSize="sm" color="textLabel">
                        Aucun document ne correspond à tes filtres.
                    </Text>
                </VStack>
            )}

            {onUpload && (
                <HStack
                    as="button"
                    type="button"
                    w="100%"
                    spacing={2}
                    p={4}
                    justify="center"
                    borderTopWidth="1px"
                    borderTopStyle="solid"
                    borderTopColor="borderDefault"
                    onClick={onUpload}
                    _hover={{ bg: rowHoverBg }}
                >
                    <BoxIcon icon={Plus} size="sm" />
                    <Text fontSize="sm" color="textLabel">
                        Téléverser un document
                    </Text>
                </HStack>
            )}

            {footer && (
                <Box borderTopWidth="1px" borderTopStyle="solid" borderTopColor="borderDefault">
                    {footer}
                </Box>
            )}
        </Box>
    );
};
