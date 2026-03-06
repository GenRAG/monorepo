/**
 * Un workspace = un RAG avec un workflow et des documents.
 */
export interface WorkspacePreview {
    id: string;
    name: string;
    /** Nombre de documents indexés dans le RAG */
    documentsCount?: number;
    /** Dernière mise à jour */
    updatedAt?: string;
}
