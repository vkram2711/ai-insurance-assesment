import PDFParser from "pdf2json";

export function parsePdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const parser = new PDFParser()

        parser.on('pdfParser_dataError', err => reject(err.parserError))
        parser.on('pdfParser_dataReady', pdfData => {
            try {
                // Debug the structure
                console.log('PDF Data Structure:', JSON.stringify(pdfData, null, 2))

                // Get the raw text content first
                const rawText = parser.getRawTextContent()

                // Try to get text from the Pages structure
                const text = pdfData?.Pages?.map(page => {
                    const pageTexts = page.Texts || []
                    return pageTexts.map(t => {
                        const decodedText = decodeURIComponent(t.R.map(r => r.T).join(''))
                        return decodedText
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

