import { basename } from 'path';

export const sanitizeFilename = (name: string): string => basename(name).replace(/[^\w.-]/g, '_');
