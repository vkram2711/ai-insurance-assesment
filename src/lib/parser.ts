import PDFParser from "pdf2json";
import mammoth from "mammoth";
import {PDFParseError, DocumentError} from "@/types/errors";

// File type constants
export const FILE_TYPES = {
    PDF: 'application/pdf',
    TXT: 'text/plain',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

export async function parseDocument(buffer: Buffer, mimeType: FileType): Promise<string> {
    switch (mimeType) {
        case FILE_TYPES.PDF:
            return parsePdf(buffer);
        case FILE_TYPES.TXT:
            return parseTxt(buffer);
        case FILE_TYPES.DOCX:
            return parseDocx(buffer);
        default:
            throw new DocumentError(`Unsupported file type: ${mimeType}`);
    }
}

function parsePdf(buffer: Buffer): Promise<string> {
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

function parseTxt(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const text = buffer.toString('utf-8')
            if (!text.trim()) {
                throw new DocumentError('No text content could be extracted from TXT file')
            }
            resolve(text)
        } catch (error) {
            reject(new DocumentError(error instanceof Error ? error.message : 'Failed to parse TXT file'))
        }
    })
}

function parseDocx(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        mammoth.extractRawText({buffer})
            .then(result => {
                const text = result.value
                if (!text.trim()) {
                    throw new DocumentError('No text content could be extracted from DOCX file')
                }
                resolve(text)
            })
            .catch(error => {
                reject(new DocumentError(error instanceof Error ? error.message : 'Failed to parse DOCX file'))
            })
    })
}

