import { Center, Text, VStack } from "@chakra-ui/react";
import { Library, Plus } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";

export const DatasetEmptyState = ({ onCreate }: { onCreate: () => void }) => (
    <Center
        py={16}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="borderDefault"
        borderRadius="12px"
        bg="surfaceCard"
    >
        <VStack spacing={3} maxW="420px" textAlign="center">
            <BoxIcon icon={Library} size="lg" />
            <Text variant="body-md-semibold">Aucune base de connaissances</Text>
            <Text variant="body-sm-muted">
                Une base regroupe des documents que vos agents consultent pour répondre. Une même base peut servir à
                plusieurs agents.
            </Text>
            <Button size="sm" variant="superPrimary" leftIcon={Plus} onClick={onCreate}>
                Créer une base
            </Button>
        </VStack>
    </Center>
);
