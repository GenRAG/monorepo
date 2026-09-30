import { describe, it, expect } from '@jest/globals';
import { EventType, NdjsonLineBuffer } from 'src/rag-engine/ndjson-line-buffer';

describe('NdjsonLineBuffer', () => {
    it('parses complete lines and keeps the trailing partial line for the next push', () => {
        const buffer = new NdjsonLineBuffer();

        expect(buffer.push('{"type":"token","data":"a"}\n{"type":"tok')).toEqual([
            { type: EventType.Token, data: 'a' },
        ]);
        expect(buffer.push('en","data":"b"}\n')).toEqual([{ type: EventType.Token, data: 'b' }]);
    });

    it('decodes a UTF-8 character whose bytes arrive in different Buffer chunks', () => {
        const buffer = new NdjsonLineBuffer();
        const bytes = Buffer.from('{"type":"token","data":"réponse 🎉"}\n', 'utf-8');
        const emojiStart = bytes.indexOf(Buffer.from('🎉', 'utf-8'));

        const events = [
            ...buffer.push(bytes.subarray(0, 26)), // splits the two bytes of "é"
            ...buffer.push(bytes.subarray(26, emojiStart + 2)), // splits the 4-byte emoji
            ...buffer.push(bytes.subarray(emojiStart + 2)),
        ];

        expect(events).toEqual([{ type: EventType.Token, data: 'réponse 🎉' }]);
    });

    it('returns the last unterminated line on flush', () => {
        const buffer = new NdjsonLineBuffer();
        buffer.push(Buffer.from('{"type":"error","data":"boom"}', 'utf-8'));

        expect(buffer.flush()).toEqual([{ type: EventType.Error, data: 'boom' }]);
    });
});
