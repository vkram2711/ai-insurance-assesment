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
