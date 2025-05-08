import { NextRequest, NextResponse } from 'next/server'
import { parsePdf } from "@/lib/parser";
import { extractPrimaryInsured } from "@/lib/llm";
import {PrimaryInsured} from "@/types/insurance";
import {findIdByFuzzyName} from "@/lib/match";
import { ValidationError, ErrorHandler } from '@/types/errors';

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            throw new ValidationError('No file uploaded')
        }

        if (!file.type.includes('pdf')) {
            throw new ValidationError('File must be a PDF')
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Parse PDF and extract information
        const text = await parsePdf(buffer)
        const primaryInsured = await extractPrimaryInsured(text)
        const insuranceMatch = await findIdByFuzzyName(primaryInsured.name)

        return NextResponse.json({
            text,
            insuranceMatch,
        })
    } catch (error) {
        const { message, statusCode } = ErrorHandler.handle(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}
