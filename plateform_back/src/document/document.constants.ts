/** File types the RAG engine can index, for every source (manual import and connectors). */
export const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'text/html',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_FILE_SIZE = 15 * 1024 * 1024;
