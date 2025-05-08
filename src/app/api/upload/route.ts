import PDFParser from 'pdf2json'
import { NextRequest, NextResponse } from 'next/server'
import {parsePdf} from "@/lib/parser";

export const runtime = 'nodejs'


export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.type.includes('pdf')) {
        return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const text = await parsePdf(buffer)

        return NextResponse.json({ text })
    } catch (err: any) {
        return NextResponse.json({
            error: 'Failed to parse PDF',
            details: err.message || err.toString(),
        }, { status: 500 })
    }
}
