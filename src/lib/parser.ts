import PDFParser from "pdf2json";

export function parsePdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const parser = new PDFParser()

        parser.on('pdfParser_dataError', err => reject(err.parserError))
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

                // Return the text that has content
                resolve(text || rawText)
            } catch (error) {
                console.error('Error parsing PDF:', error)
                reject(error)
            }
        })

        parser.parseBuffer(buffer)
    })
}

