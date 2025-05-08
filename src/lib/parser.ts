import PDFParser from "pdf2json";
import { PDFParseError } from "@/types/errors";

export function parsePdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const parser = new PDFParser()

        parser.on('pdfParser_dataError', err => {
            reject(new PDFParseError(err.parserError?.toString() || 'Unknown parser error'))
        })

        parser.on('pdfParser_dataReady', pdfData => {
            try {
                // Get the raw text content first
                const rawText = parser.getRawTextContent()

                // Try to get text from the Pages structure
                const text = pdfData?.Pages?.map(page => {
                    const pageTexts = page.Texts || []
                    return pageTexts.map(t => {
                        return decodeURIComponent(t.R.map(r => r.T).join(''))
                    }).join('\n')
                }).join('\n') || ''

                // Check if we got any text content
                if (!text && !rawText) {
                    throw new PDFParseError('No text content could be extracted')
                }

                // Return the text that has content
                resolve(text || rawText)
            } catch (error) {
                reject(error instanceof PDFParseError ? error : new PDFParseError(error instanceof Error ? error.message : 'Unknown error'))
            }
        })

        try {
            parser.parseBuffer(buffer)
        } catch (error) {
            reject(new PDFParseError(error instanceof Error ? error.message : 'Failed to parse buffer'))
        }
    })
}

