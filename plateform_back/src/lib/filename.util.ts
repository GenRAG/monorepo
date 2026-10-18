/**
 * A file name safe for a storage key and the RAG engine. Not `basename`: a Drive title is not a path, and
 * "CR 12/03/2026" would become "2026". Separators turn into dashes, so a name still cannot leave its folder.
 */
export const sanitizeFilename = (name: string): string => name.replace(/[/\\]/g, '-').replace(/[^\w.-]/g, '_');
