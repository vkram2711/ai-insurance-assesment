import {PrimaryInsured} from '@/types/insurance';
import {AiConfig} from './ai-config';
import {AIError, TokenLimitError, NetworkError} from '@/types/errors';
import {estimateTokenCount, splitIntoChunks} from './text-utils';

// Create a singleton instance of AiConfig
const openAIConfig = new AiConfig();

// Constants for token management
const TOKEN_RESERVATION = {
    SYSTEM_PROMPT: 1000,    // Reserve tokens for system prompt
    RESPONSE: 500,          // Reserve tokens for model response
    BUFFER: 1000           // Additional buffer for safety
};

/**
 * Process a single chunk of text to extract primary selector information
 * @param chunk The text chunk to process
 * @param isStreaming Whether to use streaming mode
 * @param onChunkProgress Optional callback for chunk processing progress
 * @param onLLMOutput Optional callback for LLM output
 * @returns Promise<PrimaryInsured | null> The extracted information or null if not found
 */
async function processChunk(
    chunk: string,
    isStreaming: boolean,
    onChunkProgress?: (info: string) => void,
    onLLMOutput?: (content: string) => void
): Promise<PrimaryInsured | null> {
    try {
        // Estimate tokens in the chunk
        const chunkTokens = estimateTokenCount(chunk);
        const maxTokens = openAIConfig.getMaxTokens();
        const reservedTokens = TOKEN_RESERVATION.SYSTEM_PROMPT +
            TOKEN_RESERVATION.RESPONSE +
            TOKEN_RESERVATION.BUFFER;

        if (chunkTokens > maxTokens - reservedTokens) {
            throw new TokenLimitError(`Chunk exceeds token limit: ${chunkTokens} tokens`);
        }

        if (isStreaming) {
            const stream = await openAIConfig.createStreamingChatCompletion('extract_primary_insured', {
                pdf_text: chunk
            });

            let accumulatedContent = '';
            for await (const streamChunk of stream) {
                const content = streamChunk.choices[0]?.delta?.content || '';
                if (content) {
                    accumulatedContent += content;
                    onLLMOutput?.(accumulatedContent);
                }
            }

            if (!accumulatedContent) {
                throw new AIError('No content received from LLM');
            }

            try {
                const parsedResult = JSON.parse(accumulatedContent);
                if (!parsedResult.name) {
                    throw new AIError('No name found in LLM response');
                }
                return {name: parsedResult.name};
            } catch (error) {
                const parseError = error as Error;
                throw new AIError(`Failed to parse LLM response: ${parseError.message}`);
            }
        } else {
            const response = await openAIConfig.createChatCompletion('extract_primary_insured', {
                pdf_text: chunk
            });

            const content = response.choices[0].message.content;
            if (!content) {
                throw new AIError('No content received from LLM');
            }

            try {
                const parsedResult = JSON.parse(content);
                if (!parsedResult.name) {
                    throw new AIError('No name found in LLM response');
                }
                return {name: parsedResult.name};
            } catch (error) {
                const parseError = error as Error;
                throw new AIError(`Failed to parse LLM response: ${parseError.message}`);
            }
        }
    } catch (error) {
        // Log the error for debugging
        console.error('Error processing chunk:', error);

        // Re-throw the error to be handled by the caller
        if (error instanceof AIError) {
            throw error;
        }
        throw new AIError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

/**
 * Core function that processes the extraction of primary selector information from PDF text
 * @param pdfText The text content extracted from the PDF
 * @param options Configuration options for the extraction
 * @returns Promise<PrimaryInsured> Object containing primary selector information
 */
async function processPrimaryInsuredExtraction(
    pdfText: string,
    options: {
        isStreaming: boolean;
        onChunkProgress?: (info: string) => void;
        onLLMOutput?: (content: string) => void;
    }
): Promise<PrimaryInsured> {
    try {
        // Get max tokens from config and reserve tokens for system prompt and response
        const maxTokens = openAIConfig.getMaxTokens();
        const reservedTokens = TOKEN_RESERVATION.SYSTEM_PROMPT +
            TOKEN_RESERVATION.RESPONSE +
            TOKEN_RESERVATION.BUFFER;
        const availableTokens = maxTokens - reservedTokens;

        // Split text into chunks
        const chunks = splitIntoChunks(pdfText, availableTokens);

        if (chunks.length === 0) {
            throw new AIError('No valid text chunks to process');
        }

        if (options.isStreaming) {
            options.onChunkProgress?.(`Processing document in ${chunks.length} chunks...`);
        }

        // Process each chunk and collect results
        let lastError: Error | null = null;
        for (let i = 0; i < chunks.length; i++) {
            if (options.isStreaming) {
                options.onChunkProgress?.(`Processing chunk ${i + 1} of ${chunks.length}...`);
            }
            try {
                const result = await processChunk(
                    chunks[i], 
                    options.isStreaming, 
                    options.onChunkProgress,
                    options.onLLMOutput
                );
                if (result && result.name !== "undefined") {
                    return result;
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                // Continue to next chunk if this one fails
                continue;
            }
        }

        // If we've processed all chunks and found nothing, throw the last error or a generic one
        throw lastError || new AIError('Could not find selector name in the document');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('token')) {
                throw new TokenLimitError(error.message);
            }
            if (error.message.includes('network')) {
                throw new NetworkError(error.message);
            }
        }
        throw new AIError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

/**
 * Extracts primary selector information from PDF text using OpenAI's LLM
 * @param pdfText The text content extracted from the PDF
 * @returns Promise<PrimaryInsured> Object containing primary selector information
 */
export async function extractPrimaryInsured(pdfText: string): Promise<PrimaryInsured> {
    return processPrimaryInsuredExtraction(pdfText, {isStreaming: false});
}

/**
 * Streams the extraction of primary selector information from PDF text using OpenAI's LLM
 * @param pdfText The text content extracted from the PDF
 * @param onChunkProgress Callback function that receives information about chunk processing progress
 * @param onLLMOutput Callback function that receives the raw LLM output
 * @returns Promise<PrimaryInsured> Object containing primary selector information
 */
export async function streamExtractPrimaryInsured(
    pdfText: string,
    onChunkProgress: (info: string) => void,
    onLLMOutput: (content: string) => void
): Promise<PrimaryInsured> {
    return processPrimaryInsuredExtraction(pdfText, {
        isStreaming: true,
        onChunkProgress,
        onLLMOutput
    });
}
