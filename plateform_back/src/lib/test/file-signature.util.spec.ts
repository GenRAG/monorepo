import { describe, it, expect } from '@jest/globals';
import { matchesDeclaredType } from 'src/lib/file-signature.util';

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('matchesDeclaredType', () => {
    it('accepts a PDF that starts with the PDF signature, refuses anything else declared as PDF', () => {
        expect(matchesDeclaredType(Buffer.from('%PDF-1.7 ...'), 'application/pdf')).toBe(true);
        expect(matchesDeclaredType(Buffer.from('MZ\x90\x00 executable'), 'application/pdf')).toBe(false);
    });

    it('accepts a DOCX (zip) and refuses a non-zip declared as DOCX', () => {
        expect(matchesDeclaredType(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14]), DOCX)).toBe(true);
        expect(matchesDeclaredType(Buffer.from('plain text'), DOCX)).toBe(false);
    });

    it('accepts text and refuses a binary declared as text', () => {
        expect(matchesDeclaredType(Buffer.from('# Titre\nContenu'), 'text/markdown')).toBe(true);
        expect(matchesDeclaredType(Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x00, 0x01]), 'text/plain')).toBe(false);
    });
});
