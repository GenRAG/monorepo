import { describe, expect, it } from '@jest/globals';
import { sanitizeFilename } from 'src/lib/filename.util';

describe('sanitizeFilename', () => {
    it('should keep the whole title of a Drive file with a date: it is not a path', () => {
        expect(sanitizeFilename('CR 12/03/2026.pdf')).toBe('CR_12-03-2026.pdf');
        expect(sanitizeFilename('Point 19/03/2026.pdf')).not.toBe(sanitizeFilename('CR 12/03/2026.pdf'));
    });

    it('should never leave a path separator, so a name cannot leave its storage folder', () => {
        for (const name of ['../../etc/passwd', '..\\..\\secret.txt', '/abs/path.pdf']) {
            expect(sanitizeFilename(name)).not.toMatch(/[/\\]/);
        }
    });

    it('should replace the characters the storage key and the engine do not accept', () => {
        expect(sanitizeFilename('Mon rapport (v2).pdf')).toBe('Mon_rapport__v2_.pdf');
    });

    it('should leave an already sanitized name unchanged (sources are looked up by name)', () => {
        expect(sanitizeFilename(sanitizeFilename('CR 12/03/2026.pdf'))).toBe('CR_12-03-2026.pdf');
    });
});
