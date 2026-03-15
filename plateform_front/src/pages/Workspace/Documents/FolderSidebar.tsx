import React, { useState } from "react";
import {
    VStack,
    HStack,
    Text,
    IconButton,
    Input,
    Button,
    Box,
    Collapse,
    useDisclosure,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    Icon,
    Badge,
    Tooltip,
    useColorMode,
} from "@chakra-ui/react";
import {
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronRight,
    ChevronLeft,
    X,
} from "lucide-react";
import { Folder, Document } from "pages/Workspace/Documents/document-type";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

// Icon components from lucide-react style
const FolderIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
        />
    </Icon>
);

const FolderPlusIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"
        />
    </Icon>
);

const MoreVerticalIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        />
    </Icon>
);

const FileIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
        />
    </Icon>
);

const PlusIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </Icon>
);

const TrashIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        />
    </Icon>
);

const EditIconLucide = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        />
    </Icon>
);

interface FolderSidebarProps {
    folders: Folder[];
    documents: Document[];
    selectedFolderId: string | null;
    selectedDocumentId?: string | null;
    onFolderSelect: (folderId: string | null) => void;
    onDocumentSelect?: (documentId: string) => void;
    onFolderCreate: (name: string, parentId: string | null) => void;
    onFolderRename: (folderId: string, newName: string) => void;
    onFolderDelete: (folderId: string) => void;
    showDocuments?: boolean;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    onCloseDrawer?: () => void;
}

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
    folders,
    documents,
    selectedFolderId,
    selectedDocumentId,
    onFolderSelect,
    onDocumentSelect,
    onFolderCreate,
    onFolderRename,
    onFolderDelete,
    showDocuments = true,
    sidebarCollapsed,
    setSidebarCollapsed,
    onCloseDrawer,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [creatingParentId, setCreatingParentId] = useState<string | null>(
        null,
    );
    const toast = useToast();
    const { colorMode } = useColorMode();

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) {
            toast({
                title: "Folder name required",
                status: "warning",
                duration: 2000,
            });
            return;
        }
        onFolderCreate(newFolderName, creatingParentId);
        setNewFolderName("");
        setIsCreating(false);
        setCreatingParentId(null);
    };

    const startCreatingFolder = (parentId: string | null = null) => {
        setCreatingParentId(parentId);
        setIsCreating(true);
    };

    const buildTree = (parentId: string | null = null): Folder[] => {
        return folders.filter((f) => f.parentId === parentId);
    };

    const getDocumentsByFolder = (folderId: string | null): Document[] => {
        return documents.filter((doc) => doc.folderId === folderId);
    };

    const rootDocuments = getDocumentsByFolder(null);

    return (
        <VStack
            height="100%"
            align="stretch"
            spacing={0}
            bg={colorMode === "dark" ? "grey.800" : "white"}
        >
            <HStack
                p={4}
                borderBottom="1px solid"
                borderColor={colorMode === "dark" ? "grey.700" : "grey.100"}
                justify="space-between"
            >
                <VStack align="flex-start" spacing={0}>
                    <Text
                        fontWeight="semibold"
                        fontSize="lg"
                        color={colorMode === "dark" ? "grey.100" : "grey.800"}
                    >
                        Folders
                    </Text>
                    <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "grey.300" : "grey.400"}
                        mt={1}
                    >
                        {folders.length}{" "}
                        {folders.length === 1 ? "folder" : "folders"}
                    </Text>
                </VStack>
                <HStack spacing={3}>
                    {onCloseDrawer && (
                        <IconButton
                            aria-label="Close"
                            icon={<X size={20} />}
                            size="sm"
                            variant="ghost"
                            onClick={onCloseDrawer}
                        />
                    )}
                    {!sidebarCollapsed && !onCloseDrawer && (
                        <Button
                            aria-label="Toggle"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSidebarCollapsed(!sidebarCollapsed);
                            }}
                            _hover={{
                                bg:
                                    colorMode === "dark"
                                        ? currentDarkTheme.rgba.primary20
                                        : currentDarkTheme.rgba.primary20,
                            }}
                        >
                            <Icon
                                as={
                                    sidebarCollapsed
                                        ? ChevronRight
                                        : ChevronLeft
                                }
                            />
                        </Button>
                    )}
                </HStack>
            </HStack>
            <Button
                mb={2}
                mt={4}
                mx={2}
                variant="secondary"
                _active={{ borderColor: "green.500" }}
                border="1px dashed"
                bg="white"
                borderColor="green.200"
                borderRadius="8px"
                onClick={() => startCreatingFolder(null)}
            >
                <PlusIcon
                    color={colorMode === "dark" ? "grey.100" : "grey.700"}
                    mr={2}
                />
                <Text color={colorMode === "dark" ? "grey.100" : "grey.700"}>
                    New folder
                </Text>
            </Button>
            <VStack
                flex={1}
                align="stretch"
                spacing={0}
                overflowY="auto"
                p={2}
                css={{
                    "&::-webkit-scrollbar": {
                        width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "#CBD5E0",
                        borderRadius: "4px",
                    },
                }}
            >
                <FolderItem
                    folder={null}
                    isSelected={selectedFolderId === null}
                    onSelect={() => onFolderSelect(null)}
                    level={0}
                    documentCount={rootDocuments.length}
                />
                {showDocuments &&
                    selectedFolderId === null &&
                    rootDocuments.length > 0 && (
                        <VStack align="stretch" spacing={0} mb={2}>
                            {rootDocuments.map((doc) => (
                                <DocumentItem
                                    key={doc.id}
                                    document={doc}
                                    isSelected={selectedDocumentId === doc.id}
                                    onSelect={() => onDocumentSelect?.(doc.id)}
                                    level={1}
                                />
                            ))}
                        </VStack>
                    )}
                {buildTree(null).map((folder) => (
                    <FolderTreeNode
                        key={folder.id}
                        folder={folder}
                        folders={folders}
                        documents={documents}
                        selectedFolderId={selectedFolderId}
                        selectedDocumentId={selectedDocumentId}
                        onFolderSelect={onFolderSelect}
                        onDocumentSelect={onDocumentSelect}
                        onFolderRename={onFolderRename}
                        onFolderDelete={onFolderDelete}
                        onCreateSubfolder={startCreatingFolder}
                        level={0}
                        showDocuments={showDocuments}
                        getDocumentsByFolder={getDocumentsByFolder}
                    />
                ))}
                {isCreating && (
                    <HStack px={2} py={1} pl={creatingParentId ? 8 : 2}>
                        <Input
                            size="sm"
                            placeholder="Folder name"
                            borderRadius="8px"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreateFolder();
                                if (e.key === "Escape") {
                                    setIsCreating(false);
                                    setNewFolderName("");
                                }
                            }}
                            autoFocus
                        />
                        <IconButton
                            aria-label="Create"
                            icon={<PlusIcon boxSize="24px" />}
                            size="md"
                            variant="secondary"
                            onClick={handleCreateFolder}
                        />
                    </HStack>
                )}
            </VStack>
        </VStack>
    );
};

interface FolderTreeNodeProps {
    folder: Folder;
    folders: Folder[];
    documents: Document[];
    selectedFolderId: string | null;
    selectedDocumentId?: string | null;
    onFolderSelect: (folderId: string | null) => void;
    onDocumentSelect?: (documentId: string) => void;
    onFolderRename: (folderId: string, newName: string) => void;
    onFolderDelete: (folderId: string) => void;
    onCreateSubfolder: (parentId: string) => void;
    level: number;
    showDocuments?: boolean;
    getDocumentsByFolder: (folderId: string | null) => Document[];
}

const FolderTreeNode: React.FC<FolderTreeNodeProps> = ({
    folder,
    folders,
    documents,
    selectedFolderId,
    selectedDocumentId,
    onFolderSelect,
    onDocumentSelect,
    onFolderRename,
    onFolderDelete,
    onCreateSubfolder,
    level,
    showDocuments = true,
    getDocumentsByFolder,
}) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: level === 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(folder.name);

    const children = folders.filter((f) => f.parentId === folder.id);
    const hasChildren = children.length > 0;
    const folderDocuments = getDocumentsByFolder(folder.id);
    const hasDocuments = folderDocuments.length > 0;

    const handleRename = () => {
        if (editName.trim() && editName !== folder.name) {
            onFolderRename(folder.id, editName);
        }
        setIsEditing(false);
    };

    const isSelected = selectedFolderId === folder.id;

    return (
        <Box>
            <FolderItem
                folder={folder}
                isSelected={isSelected}
                onSelect={() => onFolderSelect(folder.id)}
                hasChildren={hasChildren || hasDocuments}
                isOpen={isOpen}
                onToggle={onToggle}
                level={level}
                isEditing={isEditing}
                editName={editName}
                onEditNameChange={setEditName}
                onRenameComplete={handleRename}
                onRenameCancel={() => {
                    setIsEditing(false);
                    setEditName(folder.name);
                }}
                onStartEdit={() => setIsEditing(true)}
                onDelete={() => onFolderDelete(folder.id)}
                onCreateSubfolder={() => onCreateSubfolder(folder.id)}
                documentCount={folderDocuments.length}
            />

            {(hasChildren || hasDocuments) && (
                <Collapse in={isOpen} animateOpacity>
                    <VStack align="stretch" spacing={1}>
                        {showDocuments && hasDocuments && (
                            <>
                                {folderDocuments.map((doc) => (
                                    <DocumentItem
                                        key={doc.id}
                                        document={doc}
                                        isSelected={
                                            selectedDocumentId === doc.id
                                        }
                                        onSelect={() =>
                                            onDocumentSelect?.(doc.id)
                                        }
                                        level={level + 1}
                                    />
                                ))}
                            </>
                        )}
                        {children.map((child) => (
                            <FolderTreeNode
                                key={child.id}
                                folder={child}
                                folders={folders}
                                documents={documents}
                                selectedFolderId={selectedFolderId}
                                selectedDocumentId={selectedDocumentId}
                                onFolderSelect={onFolderSelect}
                                onDocumentSelect={onDocumentSelect}
                                onFolderRename={onFolderRename}
                                onFolderDelete={onFolderDelete}
                                onCreateSubfolder={onCreateSubfolder}
                                level={level + 1}
                                showDocuments={showDocuments}
                                getDocumentsByFolder={getDocumentsByFolder}
                            />
                        ))}
                    </VStack>
                </Collapse>
            )}
        </Box>
    );
};

interface FolderItemProps {
    folder: Folder | null;
    isSelected: boolean;
    onSelect: () => void;
    hasChildren?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
    level: number;
    isEditing?: boolean;
    editName?: string;
    onEditNameChange?: (name: string) => void;
    onRenameComplete?: () => void;
    onRenameCancel?: () => void;
    onStartEdit?: () => void;
    onDelete?: () => void;
    onCreateSubfolder?: () => void;
    documentCount?: number;
}

const FolderItem: React.FC<FolderItemProps> = ({
    folder,
    isSelected,
    onSelect,
    hasChildren,
    isOpen,
    onToggle,
    level,
    isEditing,
    editName,
    onEditNameChange,
    onRenameComplete,
    onRenameCancel,
    onStartEdit,
    onDelete,
    onCreateSubfolder,
    documentCount = 0,
}) => {
    const isAllDocuments = folder === null;
    const { colorMode } = useColorMode();

    return (
        <HStack
            px={2}
            py={2}
            pl={isAllDocuments ? 2 : 2 + level * 20}
            spacing={1}
            bg={
                isSelected
                    ? colorMode === "dark"
                        ? "grey.700"
                        : "green.50"
                    : "transparent"
            }
            borderRadius="8px"
            cursor="pointer"
            _hover={{
                bg: isSelected
                    ? colorMode === "dark"
                        ? "grey.700"
                        : "green.50"
                    : colorMode === "dark"
                      ? "grey.700"
                      : "green.50",
            }}
            onClick={onSelect}
            role="button"
            mb={isAllDocuments ? 2 : 1}
        >
            {hasChildren && !isAllDocuments && (
                <IconButton
                    aria-label="Toggle"
                    icon={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle?.();
                        onSelect();
                    }}
                />
            )}
            <FolderIcon
                color={isSelected ? "green.600" : "gray.500"}
                fontSize="16px"
                ml={!hasChildren && !isAllDocuments ? 5 : 0}
            />
            {isEditing ? (
                <Input
                    size="sm"
                    value={editName}
                    onChange={(e) => onEditNameChange?.(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onRenameComplete?.();
                        if (e.key === "Escape") onRenameCancel?.();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    flex={1}
                />
            ) : (
                <Text
                    fontSize="sm"
                    fontWeight={isSelected ? "medium" : "normal"}
                    color={
                        isSelected
                            ? colorMode === "dark"
                                ? "grey.100"
                                : "grey.700"
                            : colorMode === "dark"
                              ? "grey.100"
                              : "grey.500"
                    }
                    flex={1}
                    noOfLines={1}
                >
                    {isAllDocuments ? "All Documents" : folder.name}
                </Text>
            )}
            {documentCount > 0 && !isEditing && (
                <Badge
                    colorScheme="gray"
                    fontSize="xs"
                    borderRadius="full"
                    px={2}
                >
                    {documentCount}
                </Badge>
            )}
            {!isAllDocuments && !isEditing && (
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label="Folder actions"
                        icon={<MoreVerticalIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        sx={{
                            ".chakra-stack:hover &": {
                                opacity: 1,
                            },
                        }}
                    />
                    <MenuList
                        borderRadius="8px"
                        maxW="150px"
                        minW="150px"
                        fontSize="sm"
                        m="0"
                        p="0"
                        bg={colorMode === "dark" ? "grey.800" : "white"}
                    >
                        <MenuItem
                            color={
                                colorMode === "dark" ? "grey.300" : "grey.500"
                            }
                            borderTopRadius="8px"
                            fontWeight="normal"
                            icon={<FolderPlusIcon />}
                            onClick={onCreateSubfolder}
                        >
                            New subfolder
                        </MenuItem>
                        <MenuItem
                            color={
                                colorMode === "dark" ? "grey.300" : "grey.500"
                            }
                            fontWeight="normal"
                            icon={<EditIconLucide />}
                            onClick={onStartEdit}
                        >
                            Rename
                        </MenuItem>
                        <MenuItem
                            color={colorMode === "dark" ? "red.500" : "red.500"}
                            borderBottomRadius="8px"
                            fontWeight="normal"
                            icon={<TrashIcon />}
                            onClick={onDelete}
                        >
                            Delete
                        </MenuItem>
                    </MenuList>
                </Menu>
            )}
        </HStack>
    );
};

interface DocumentItemProps {
    document: Document;
    isSelected?: boolean;
    onSelect?: () => void;
    level: number;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
    document,
    isSelected = false,
    onSelect,
    level,
}) => {
    const { colorMode } = useColorMode();

    const getStatusColor = (status: Document["status"]) => {
        switch (status) {
            case "indexed":
                return "green";
            case "processing":
                return "yellow";
            case "failed":
                return "red";
            default:
                return "gray";
        }
    };

    return (
        <HStack
            px={2}
            py={1.5}
            pl={2 + (level + 1) * 20}
            spacing={2}
            bg={
                isSelected
                    ? colorMode === "dark"
                        ? "grey.700"
                        : "green.50"
                    : "transparent"
            }
            borderRadius="8px"
            cursor="pointer"
            _hover={{
                bg: isSelected
                    ? colorMode === "dark"
                        ? "grey.700"
                        : "green.50"
                    : colorMode === "dark"
                      ? "grey.600"
                      : "gray.50",
            }}
            onClick={onSelect}
            role="button"
        >
            <FileIcon
                color={isSelected ? "green.500" : "gray.400"}
                fontSize="14px"
            />
            <Tooltip label={document.name} placement="right">
                <Text
                    fontSize="xs"
                    color={
                        isSelected
                            ? colorMode === "dark"
                                ? "grey.100"
                                : "grey.700"
                            : colorMode === "dark"
                              ? "grey.200"
                              : "gray.600"
                    }
                    flex={1}
                    noOfLines={1}
                    fontWeight={isSelected ? "medium" : "normal"}
                >
                    {document.name}
                </Text>
            </Tooltip>
            <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={`${getStatusColor(document.status)}.400`}
                flexShrink={0}
            />
        </HStack>
    );
};
