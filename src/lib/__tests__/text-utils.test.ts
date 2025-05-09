import {estimateTokenCount, splitIntoChunks} from '../text-utils';

describe('Token Management Utilities', () => {
    describe('estimateTokenCount', () => {
        it('should estimate tokens based on character count', () => {
            // Test with various text lengths
            expect(estimateTokenCount('')).toBe(0);
            expect(estimateTokenCount('a')).toBe(1);
            expect(estimateTokenCount('hello')).toBe(2); // 5 chars ≈ 2 tokens
            expect(estimateTokenCount('hello world')).toBe(3); // 11 chars ≈ 3 tokens
        });

        it('should handle special characters and spaces', () => {
            expect(estimateTokenCount('hello, world!')).ztoBe(4); // 13 chars ≈ 4 tokens
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
            const text = `First paragraph that is quite long and should be split into multiple chunks.

Second paragraph that is also quite long and should be split into multiple chunks.

Third paragraph that continues the pattern of being long enough to require splitting.`;
            const chunks = splitIntoChunks(text, 20);

            // Verify each chunk is within token limit
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(20);
            });

            // Verify content is preserved
            const reconstructed = chunks.join('\n\n');
            expect(reconstructed.replace(/\s+/g, ' ')).toBe(text.replace(/\s+/g, ' '));
        });

        it('should split long text into sentences when appropriate', () => {
            const text = 'This is a very long first sentence that should be split. This is another long sentence that needs splitting. And here is the final sentence.';
            const chunks = splitIntoChunks(text, 15);

            // Verify each chunk is within token limit
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(15);
            });

            // Verify content is preserved
            expect(chunks.join(' ')).toBe(text);
        });

        it('should split very long words when necessary', () => {
            const text = 'ThisIsAnExtremelyLongWordThatDefinitelyNeedsToBeSplitIntoMultipleChunks';
            const chunks = splitIntoChunks(text, 10);

            // Should be split into multiple chunks
            expect(chunks.length).toBeGreaterThan(1);

            // Each chunk should be within limit
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(10);
            });

            // Content should be preserved
            expect(chunks.join('')).toBe(text);
        });

        it('should maintain text integrity when splitting', () => {
            const text = 'First complete sentence. Second complete sentence. Third complete sentence.';
            const chunks = splitIntoChunks(text, 20);

            // Each chunk should be a complete sentence or part
            chunks.forEach(chunk => {
                // Should either be a complete sentence or a valid part
                expect(
                    chunk.match(/^[A-Z].*[.!?]$/) || // Complete sentence
                    chunk.match(/^[A-Za-z]/) // Valid part
                ).toBeTruthy();
            });

            // Content should be preserved
            expect(chunks.join(' ')).toBe(text);
        });

        it('should handle mixed content appropriately', () => {
            const text = `Short paragraph.

This is a longer paragraph that needs to be split into multiple chunks because it contains more text than would fit within the token limit. It has multiple sentences.

Another short paragraph.`;
            const chunks = splitIntoChunks(text, 40);

            // Verify chunks are properly split and within limits
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(40);
            });

            // Verify content is preserved
            const reconstructed = chunks.join('\n\n');
            expect(reconstructed.replace(/\s+/g, ' ')).toBe(text.replace(/\s+/g, ' '));
        });

        it('should handle edge cases', () => {
            // Single character
            expect(splitIntoChunks('a', 1)).toEqual(['a']);

            // Very small token limit
            const text = 'Hello world';
            const chunks = splitIntoChunks(text, 2);
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(2);
            });
            expect(chunks.join(' ')).toBe(text);

            // Special characters
            const specialChars = '!@#$%^&*()';
            const chunks2 = splitIntoChunks(specialChars, 2);
            chunks2.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(2);
            });
            expect(chunks2.join('')).toBe(specialChars);
        });

        it('should handle real-world insurance document text', () => {
            const insuranceText = `POLICY INFORMATION
Policy Number: 123456789
Effective Date: 01/01/2024
Expiration Date: 01/01/2025

PRIMARY INSURED
Name: John Smith
Address: 123 Main St, Anytown, USA
Phone: (555) 123-4567

COVERAGE DETAILS
Type: Homeowners Insurance
Coverage Amount: $500,000
Deductible: $1,000

ADDITIONAL INFORMATION
This policy provides coverage for the primary residence located at the above address.
All terms and conditions are subject to the policy provisions.`;

            const chunks = splitIntoChunks(insuranceText, 50);

            // Verify chunks are properly split
            chunks.forEach(chunk => {
                expect(estimateTokenCount(chunk)).toBeLessThanOrEqual(50);
                // Verify each chunk starts with a section header or meaningful content
                expect(chunk).toMatch(/^(POLICY|PRIMARY|COVERAGE|ADDITIONAL|Name:|Address:|Phone:|Type:|Coverage|Deductible:|This|All)/);
            });

            // Verify content is preserved
            const reconstructed = chunks.join('\n\n');
            expect(reconstructed.replace(/\s+/g, ' ')).toBe(insuranceText.replace(/\s+/g, ' '));
        });
    });
}); 