declare module 'pdf-parse' {
    import { Buffer } from 'buffer'

    interface PDFInfo {
        text: string
        numpages: number
        numrender: number
        info: any
        metadata: any
        version: string
    }

    function pdf(dataBuffer: Buffer): Promise<PDFInfo>

    export = pdf
}
