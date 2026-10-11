const PDF_MAGIC = Buffer.from('%PDF-');
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const looksLikeText = (buffer: Buffer): boolean => !buffer.subarray(0, 8192).includes(0);

export const matchesDeclaredType = (buffer: Buffer, mimeType: string): boolean => {
    if (mimeType === 'application/pdf') return buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC);
    if (mimeType === DOCX_MIME) return buffer.subarray(0, ZIP_MAGIC.length).equals(ZIP_MAGIC);
    return looksLikeText(buffer);
};
