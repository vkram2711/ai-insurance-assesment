import {NextRequest, NextResponse} from 'next/server'
import {parsePdf} from "@/lib/parser";
import {extractPrimaryInsured} from "@/lib/llm";
import {PrimaryInsured} from "@/types/insurance";
import {findIdByFuzzyName} from "@/lib/match";
import {ValidationError, ErrorHandler} from '@/types/errors';

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendProgress = async (message: string) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({type: 'progress', message})}\n\n`));
    };

    const sendResult = async (data: any) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({type: 'result', data})}\n\n`));
    };

    const sendError = async (error: string) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({type: 'error', error})}\n\n`));
        await writer.close();
    };

    void (async () => {
        try {
            const formData = await req.formData()
            const file = formData.get('file') as File

            if (!file) {
                throw new ValidationError('No file uploaded')
            }

            if (!file.type.includes('pdf')) {
                throw new ValidationError('File must be a PDF')
            }

            await sendProgress('Starting file processing...');
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            await sendProgress('Parsing PDF...');
            const text = await parsePdf(buffer)

            await sendProgress('Extracting primary insured information...');
            const primaryInsured = await extractPrimaryInsured(text)

            await sendProgress('Finding insurance match...');
            const insuranceMatch = await findIdByFuzzyName(primaryInsured.name)

            await sendProgress('Processing complete!');
            await sendResult({
                text,
                insuranceMatch,
            });
            await writer.close();
        } catch (error) {
            const {message} = ErrorHandler.handle(error)
            await sendError(message);
        }
    })();

    return new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
