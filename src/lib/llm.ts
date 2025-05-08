import {PrimaryInsured} from '@/types/insurance';
import { AiConfig } from './ai-config';
import { AIError, TokenLimitError, NetworkError } from '@/types/errors';

// Create a singleton instance of AiConfig
const openAIConfig = new AiConfig();

/**
 * Extracts primary insured information from PDF text using OpenAI's LLM
 * @param pdfText The text content extracted from the PDF
 * @returns Promise<PrimaryInsured> Object containing primary insured information
 */
export async function extractPrimaryInsured(pdfText: string): Promise<PrimaryInsured> {
    // Create chat completion using the configuration
    const response = await openAIConfig.createChatCompletion('extract_primary_insured', {
        pdf_text: pdfText
    });

    const content = response.choices[0].message.content;
    if (!content) {
        throw new AIError('No response content received from LLM');
    }

    const parsedResult = JSON.parse(content);
    if (!parsedResult.name) {
        throw new AIError('Could not find insured name in the document');
    }

    return {
        name: parsedResult.name
    };
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
    try {
        const stream = await openAIConfig.createStreamingChatCompletion('extract_primary_insured', {
            pdf_text: pdfText
        });

        let accumulatedContent = '';
        
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                accumulatedContent += content;
                onProgress(content);
            }
        }

        if (!accumulatedContent) {
            throw new AIError('No response content received from LLM');
        }

        const parsedResult = JSON.parse(accumulatedContent);
        if (!parsedResult.name) {
            throw new AIError('Could not find insured name in the document');
        }

        return {
            name: parsedResult.name
        };
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
