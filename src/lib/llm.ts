import {PrimaryInsured} from '@/types/insurance';
import { AiConfig } from './ai-config';
import { AIError, TokenLimitError, NetworkError } from '@/types/errors';
import { estimateTokenCount, splitIntoChunks } from './text-utils';

// Create a singleton instance of AiConfig
const openAIConfig = new AiConfig();

// Constants for token management
const TOKEN_RESERVATION = {
    SYSTEM_PROMPT: 2000,    // Reserve tokens for system prompt
    RESPONSE: 1000,         // Reserve tokens for model response
    BUFFER: 5000           // Additional buffer for safety
};

/**
 * Process a single chunk of text to extract primary insured information
 * @param chunk The text chunk to process
 * @param isStreaming Whether to use streaming mode
 * @param onProgress Optional callback for streaming progress
 * @returns Promise<PrimaryInsured | null> The extracted information or null if not found
 */
async function processChunk(
    chunk: string,
    isStreaming: boolean,
    onProgress?: (chunk: string) => void
): Promise<PrimaryInsured | null> {
    try {
        if (isStreaming) {
            const stream = await openAIConfig.createStreamingChatCompletion('extract_primary_insured', {
                pdf_text: chunk
            });

            let accumulatedContent = '';
            for await (const streamChunk of stream) {
                const content = streamChunk.choices[0]?.delta?.content || '';
                if (content) {
                    accumulatedContent += content;
                    onProgress?.(content);
                }
            }

            if (!accumulatedContent) return null;
            const parsedResult = JSON.parse(accumulatedContent);
            return parsedResult.name ? { name: parsedResult.name } : null;
        } else {
            const response = await openAIConfig.createChatCompletion('extract_primary_insured', {
                pdf_text: chunk
            });

            const content = response.choices[0].message.content;
            if (!content) return null;

            const parsedResult = JSON.parse(content);
            return parsedResult.name ? { name: parsedResult.name } : null;
        }
    } catch (error) {
        console.error('Error processing chunk:', error);
        return null;
    }
}

/**
 * Core function that processes the extraction of primary insured information from PDF text
 * @param pdfText The text content extracted from the PDF
 * @param options Configuration options for the extraction
 * @returns Promise<PrimaryInsured> Object containing primary insured information
 */
async function processPrimaryInsuredExtraction(
    pdfText: string,
    options: {
        isStreaming: boolean;
        onProgress?: (chunk: string) => void;
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
        
        // Process each chunk and collect results
        for (let i = 0; i < chunks.length; i++) {
            if (options.isStreaming) {
                options.onProgress?.(`Processing chunk ${i + 1} of ${chunks.length}...`);
            }
            const result = await processChunk(chunks[i], options.isStreaming, options.onProgress);
            if (result) {
                return result;
            }
        }

        throw new AIError('Could not find insured name in the document');
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
 * Extracts primary insured information from PDF text using OpenAI's LLM
 * @param pdfText The text content extracted from the PDF
 * @returns Promise<PrimaryInsured> Object containing primary insured information
 */
export async function extractPrimaryInsured(pdfText: string): Promise<PrimaryInsured> {
    return processPrimaryInsuredExtraction(pdfText, { isStreaming: false });
}

/**
 * Streams the extraction of primary insured information from PDF text using OpenAI's LLM
 * @param pdfText The text content extracted from the PDF
 * @param onProgress Callback function that receives progress updates
 * @returns Promise<PrimaryInsured> Object containing primary insured information
 */
export async function streamExtractPrimaryInsured(
    pdfText: string,
    onProgress: (chunk: string) => void
): Promise<PrimaryInsured> {
    return processPrimaryInsuredExtraction(pdfText, { 
        isStreaming: true,
        onProgress
    });
}
