import {PrimaryInsured} from '@/types/insurance';
import { AiConfig } from './ai-config';

// Create a singleton instance of AiConfig
const openAIConfig = new AiConfig();

/**
 * Extracts primary insured information from PDF text using OpenAI's LLM
 * @param pdfText The text content extracted from the PDF
 * @returns Promise<PrimaryInsured> Object containing primary insured information
 */
export async function extractPrimaryInsured(pdfText: string): Promise<PrimaryInsured> {
    try {
        // Create chat completion using the configuration
        const response = await openAIConfig.createChatCompletion('extract_primary_insured', {
            pdf_text: pdfText
        });

        const parsedResult = JSON.parse(response.choices[0].message.content || '{}');

        return {
            name: parsedResult.name || ''
        };
    } catch (error) {
        console.error('Error extracting primary insured information:', error);
        throw new Error('Failed to extract primary insured information');
    }
}
