import {PrimaryInsured} from '@/types/insurance';

/**
 * Extracts primary insured information from PDF text using OpenAI's LLM
 * @param pdfText The text content extracted from the PDF
 * @returns Promise<PrimaryInsured> Object containing primary insured information
 */
export async function extractPrimaryInsured(pdfText: string): Promise<PrimaryInsured> {
    try {
        // Import aiconfig only on the server side
        const { AIConfigRuntime } = await import('aiconfig');
        const aiConfig = await AIConfigRuntime.load('aiconfig.yaml');

        // Execute the prompt with the PDF text
        const result = await aiConfig.runPrompt('extract_primary_insured', {
            pdf_text: pdfText
        });

        // Parse the result
        const parsedResult = JSON.parse(result.output);

        return {
            name: parsedResult.name || ''
        };
    } catch (error) {
        console.error('Error extracting primary insured information:', error);
        throw new Error('Failed to extract primary insured information');
    }
}
