import {estimateTokenCount, splitIntoChunks} from '../text-utils';

describe('Token Management Utilities', () => {
    describe('estimateTokenCount', () => {
        it('should estimate tokens based on character count', () => {
            expect(estimateTokenCount('')).toBe(0);
            expect(estimateTokenCount('a')).toBe(1);
            expect(estimateTokenCount('hello')).toBe(2); // 5 chars ≈ 2 tokens
            expect(estimateTokenCount('hello world')).toBe(3); // 11 chars ≈ 3 tokens
        });

        it('should handle special characters and spaces', () => {
            expect(estimateTokenCount('hello, world!')).toBe(4); // 13 chars ≈ 4 tokens
            expect(estimateTokenCount('hello\nworld')).toBe(3); // 11 chars ≈ 3 tokens
            expect(estimateTokenCount('hello\tworld')).toBe(3); // 11 chars ≈ 3 tokens
        });

        it('should handle long text', () => {
            const longText = 'a'.repeat(1000);
            expect(estimateTokenCount(longText)).toBe(250); // 1000 chars ≈ 250 tokens
        });
    });

    describe('splitIntoChunks', () => {
        it('should handle empty text', () => {
            expect(splitIntoChunks('', 100)).toEqual([]);
        });

        it('should not split text that fits within token limit', () => {
            const text = 'This is a short text that fits within the limit.';
            const chunks = splitIntoChunks(text, 100);
            expect(chunks).toHaveLength(1);
            expect(chunks[0]).toBe(text);
        });

        it('should split text by paragraphs when needed', () => {
            const text = `First paragraph.

Second paragraph.

Third paragraph.`;
            const chunks = splitIntoChunks(text, 10);

            // Verify each chunk is within token limit
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(10);
            });

            // Verify all paragraphs are present in the output
            const normalizedText = text.replace(/\s+/g, ' ').trim();
            chunks.forEach(chunk => {
                const normalizedChunk = chunk.replace(/\s+/g, ' ').trim();
                expect(normalizedText).toContain(normalizedChunk.replace(/\s+/g, ' ').trim());
            });
        });

        it('should split long text into sentences when appropriate', () => {
            const text = 'First sentence. Second sentence. Third sentence.';
            const chunks = splitIntoChunks(text, 10);

            // Verify each chunk is within token limit
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(10);
            });

            // Verify all sentences are present in the output
            const sentences = text.split(/[.!?]\s+/);
            sentences.forEach(sentence => {
                if (sentence.trim()) {
                    const found = chunks.some(chunk => 
                        chunk.includes(sentence.trim())
                    );
                    expect(found).toBeTruthy();
                }
            });
        });

        it('should handle very long words appropriately', () => {
            const text = 'supercalifragilisticexpialidocious';
            const chunks = splitIntoChunks(text, 10);

            // Each chunk should be within token limit
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(10);
            });

            // The original word should be preserved
            const reconstructed = chunks.join('');
            expect(reconstructed).toBe(text);
        });

        it('should maintain text integrity when splitting', () => {
            const text = 'First sentence. Second sentence. Third sentence.';
            const chunks = splitIntoChunks(text, 15);

            // Each chunk should start with a capital letter or be a continuation
            chunks.forEach(chunk => {
                expect(chunk).toMatch(/^[A-Z]|^[a-z]/);
            });

            // The original content should be preserved in order
            let lastIndex = -1;
            chunks.forEach(chunk => {
                const chunkStart = chunk.split(' ')[0];
                const newIndex = text.indexOf(chunkStart);
                if (newIndex !== -1) {
                    expect(newIndex).toBeGreaterThanOrEqual(lastIndex);
                    lastIndex = newIndex;
                }
            });
        });

        it('should handle mixed content appropriately', () => {
            const text = `Short line.
Longer line with more content.
Very long line that should definitely be split into multiple pieces because it exceeds the token limit.`;
            const chunks = splitIntoChunks(text, 15);

            // Verify chunks are properly split and within limits
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(15);
            });

            // Verify all lines are present in the output
            const lines = text.split('\n');
            lines.forEach(line => {
                const found = chunks.some(chunk => 
                    chunk.includes(line.trim()) || 
                    line.includes(chunk.trim())
                );
                expect(found).toBeTruthy();
            });
        });

        it('should handle edge cases', () => {
            // Single character
            expect(splitIntoChunks('a', 1)).toEqual(['a']);

            // Single word
            const singleWord = splitIntoChunks('hello', 2);
            expect(singleWord.length).toBeGreaterThanOrEqual(1);
            singleWord.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(2);
            });

            // Special characters
            const specialChars = '!@#$%^&*()';
            const specialChunks = splitIntoChunks(specialChars, 3);
            specialChunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(3);
            });
            expect(specialChunks.join('')).toBe(specialChars);
        });

        it('should handle real-world insurance document text', () => {
            const insuranceText = `POLICY DETAILS
Number: ABC123
Date: 2024-01-01

COVERAGE
Type: Full
Amount: $1000`;

            const chunks = splitIntoChunks(insuranceText, 10);

            // Verify chunks are within token limit
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(10);
            });

            // Verify key information is preserved
            const keyTerms = ['POLICY', 'Number:', 'ABC123', 'COVERAGE', 'Type:', 'Full'];
            keyTerms.forEach(term => {
                const found = chunks.some(chunk => chunk.includes(term));
                expect(found).toBeTruthy();
            });

            // Verify structure is maintained
            const firstChunk = chunks[0];
            expect(firstChunk).toMatch(/^POLICY/);
        });
    });
}); 