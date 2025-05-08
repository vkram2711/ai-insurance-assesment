import { NextRequest, NextResponse } from 'next/server'
import { parsePdf } from "@/lib/parser";
import { extractPrimaryInsured } from "@/lib/llm";
import {PrimaryInsured} from "@/types/insurance";
import {findIdByFuzzyName} from "@/lib/match";

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
        return NextResponse.json(
            { error: 'No file uploaded' },
            { status: 400 }
        )
    }

    if (!file.type.includes('pdf')) {
        return NextResponse.json(
            { error: 'File must be a PDF' },
            { status: 400 }
        )
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const text = await parsePdf(buffer)

        // Extract primary insured information
        const primaryInsured: PrimaryInsured = await extractPrimaryInsured(text)
        const insuredId = findIdByFuzzyName(primaryInsured.name)
        return NextResponse.json({
            text,
            insuredId,
            primaryInsured,
        })
    } catch (err: any) {
        return NextResponse.json(
            {
                error: 'Failed to process PDF',
                details: err.message || err.toString(),
            },
            { status: 500 }
        )
    }
}
