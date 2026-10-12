import { Box, Center, Icon, Image } from "@chakra-ui/react";
import { Upload } from "lucide-react";
import GoogleDriveLogo from "assets/icons/google-drive.svg";
import MicrosoftLogo from "assets/icons/microsoft.svg";
import NotionLogo from "assets/icons/notion.svg";
import { DocumentSource } from "types/dataset/dataset";

const LOGOS: Partial<Record<DocumentSource, string>> = {
    GOOGLE_DRIVE: GoogleDriveLogo,
    SHAREPOINT: MicrosoftLogo,
    NOTION: NotionLogo,
};

/** Brand logo of a connector (manual import: an upload icon). */
export const DocumentSourceIcon = ({ source = "UPLOAD", size = 20 }: { source?: DocumentSource; size?: number }) => {
    const logo = LOGOS[source];
    return logo ? (
        // White tile so dark logos (Notion) stay visible in dark mode.
        <Box w={`${size}px`} h={`${size}px`} p="3px" borderRadius="5px" bg="white" flexShrink={0}>
            <Image src={logo} alt="" w="100%" h="100%" objectFit="contain" />
        </Box>
    ) : (
        <Center w={`${size}px`} h={`${size}px`} borderRadius="5px" bg="accentIconBg" color="green.500" flexShrink={0}>
            <Icon as={Upload} boxSize={`${Math.round(size * 0.6)}px`} />
        </Center>
    );
};
