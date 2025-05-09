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

    // Try to split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());

    for (const paragraph of paragraphs) {
        // If the paragraph fits within the token limit, add it as is
        if (estimateTokenCount(paragraph) <= maxTokens) {
            chunks.push(paragraph);
            continue;
        }

        // Try to split by sentences
        const sentences = paragraph
            .match(/[^.!?]+[.!?]+/g)
            ?.map(s => s.trim())
            .filter(Boolean) || [paragraph];

        for (const sentence of sentences) {
            // If the sentence fits within the token limit, add it as is
            if (estimateTokenCount(sentence) <= maxTokens) {
                chunks.push(sentence);
                continue;
            }

            // Split sentence into words
            const words = sentence.split(/\s+/).filter(w => w.trim());
            let currentChunk = '';
            let currentTokens = 0;

            for (const word of words) {
                const wordTokens = estimateTokenCount(word);
                const spaceTokens = currentChunk ? 1 : 0; // Account for space between words

                // If a single word is too large, split it into parts
                if (wordTokens > maxTokens) {
                    // Add current chunk if it exists
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                        currentChunk = '';
                        currentTokens = 0;
                    }

                    // Split the word into parts
                    let part = '';
                    let partTokens = 0;

                    for (let i = 0; i < word.length; i++) {
                        const char = word[i];
                        const charTokens = estimateTokenCount(char);

                        if (partTokens + charTokens > maxTokens) {
                            if (part) {
                                chunks.push(part);
                                part = '';
                                partTokens = 0;
                            }
                            part = char;
                            partTokens = charTokens;
                        } else {
                            part += char;
                            partTokens += charTokens;
                        }
                    }

                    if (part) {
                        chunks.push(part);
                    }
                }
                // If adding this word would exceed the limit, start a new chunk
                else if (currentTokens + wordTokens + spaceTokens > maxTokens) {
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                    }
                    currentChunk = word;
                    currentTokens = wordTokens;
                }
                // Add word to current chunk
                else {
                    currentChunk += (currentChunk ? ' ' : '') + word;
                    currentTokens += wordTokens + spaceTokens;
                }
            }

            // Add any remaining chunk
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
        }
    }

    return chunks;
} 