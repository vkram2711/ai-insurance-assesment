/**
 * Estimates the number of tokens in a text string
 * @param text The text to count tokens for
 * @returns Estimated number of tokens
 */
export function estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // Special characters and whitespace count as 1 token each
    return Math.ceil(text.length / 4);
}

/**
 * Splits text into chunks that fit within token limits
 * @param text The text to split into chunks
 * @param maxTokens Maximum number of tokens per chunk
 * @returns Array of text chunks
 */
export function splitIntoChunks(text: string, maxTokens: number): string[] {
    if (!text) return [];

    // If the entire text fits within the token limit and doesn't need splitting, return it as is
    if (estimateTokenCount(text) <= maxTokens) {
        return [text];
    }

    const chunks: string[] = [];
    const overlapTokens = Math.floor(maxTokens * 0.1); // 10% overlap between chunks
    const effectiveMaxTokens = maxTokens - overlapTokens;

    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    let currentChunk = '';
    let currentTokens = 0;

    for (const paragraph of paragraphs) {
        const paragraphTokens = estimateTokenCount(paragraph);

        // If adding this paragraph would exceed the limit, start a new chunk
        if (currentTokens + paragraphTokens > effectiveMaxTokens && currentChunk) {
            chunks.push(currentChunk.trim());
            // Start new chunk with overlap from previous chunk
            const overlapText = getOverlapText(currentChunk, overlapTokens);
            currentChunk = overlapText;
            currentTokens = estimateTokenCount(overlapText);
        }

        // If a single paragraph is too large, split it by sentences
        if (paragraphTokens > effectiveMaxTokens) {
            const sentences = paragraph
                .match(/[^.!?]+[.!?]+/g)
                ?.map(s => s.trim())
                .filter(Boolean) || [paragraph];

            for (const sentence of sentences) {
                const sentenceTokens = estimateTokenCount(sentence);

                // If adding this sentence would exceed the limit, start a new chunk
                if (currentTokens + sentenceTokens > effectiveMaxTokens && currentChunk) {
                    chunks.push(currentChunk.trim());
                    // Start new chunk with overlap from previous chunk
                    const overlapText = getOverlapText(currentChunk, overlapTokens);
                    currentChunk = overlapText;
                    currentTokens = estimateTokenCount(overlapText);
                }

                // If a single sentence is too large, split it by words
                if (sentenceTokens > effectiveMaxTokens) {
                    const words = sentence.split(/\s+/).filter(w => w.trim());
                    
                    for (const word of words) {
                        const wordTokens = estimateTokenCount(word);
                        const spaceTokens = currentChunk ? 1 : 0;

                        if (currentTokens + wordTokens + spaceTokens > effectiveMaxTokens && currentChunk) {
                            chunks.push(currentChunk.trim());
                            // Start new chunk with overlap from previous chunk
                            const overlapText = getOverlapText(currentChunk, overlapTokens);
                            currentChunk = overlapText;
                            currentTokens = estimateTokenCount(overlapText);
                        }

                        currentChunk += (currentChunk ? ' ' : '') + word;
                        currentTokens += wordTokens + spaceTokens;
                    }
                } else {
                    currentChunk += (currentChunk ? ' ' : '') + sentence;
                    currentTokens += sentenceTokens + (currentChunk ? 1 : 0);
                }
            }
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            currentTokens += paragraphTokens + (currentChunk ? 2 : 0);
        }
    }

    // Add the last chunk if it exists
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Gets overlap text from the end of a chunk
 * @param text The text to get overlap from
 * @param overlapTokens Number of tokens to include in overlap
 * @returns Overlap text
 */
function getOverlapText(text: string, overlapTokens: number): string {
    const words = text.split(/\s+/);
    let overlapText = '';
    let overlapTokenCount = 0;

    // Start from the end and work backwards
    for (let i = words.length - 1; i >= 0; i--) {
        const word = words[i];
        const wordTokens = estimateTokenCount(word);
        const spaceTokens = overlapText ? 1 : 0;

        if (overlapTokenCount + wordTokens + spaceTokens > overlapTokens) {
            break;
        }

        overlapText = word + (overlapText ? ' ' + overlapText : '');
        overlapTokenCount += wordTokens + spaceTokens;
    }

    return overlapText;
} 