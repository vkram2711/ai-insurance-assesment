import {NextRequest} from 'next/server'
import {parseDocument} from "@/lib/parser";
import {FILE_TYPES, FileType} from "@/types/files";
import {streamExtractPrimaryInsured} from "@/lib/llm";
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

    const sendLLMUpdate = async (message: string) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({type: 'llm_update', message})}\n\n`));
    };

    const sendLLMChunk = async (chunk: string) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({type: 'llm_chunk', chunk})}\n\n`));
    };

    const sendResult = async (data: any) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({type: 'result', data})}\n\n`));
    };

    const sendError = async (error: string) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({type: 'error', error})}\n\n`));
        await writer.close();
    };

    const truncateText = (text: string, maxLength: number = 1000): string => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    void (async () => {
        try {
            const formData = await req.formData()
            const file = formData.get('file') as File

            if (!file) {
                throw new ValidationError('No file uploaded')
            }

            const allowedTypes = [FILE_TYPES.PDF, FILE_TYPES.TXT, FILE_TYPES.DOCX] as const
            if (!allowedTypes.includes(file.type as FileType)) {
                throw new ValidationError('File must be a PDF, TXT, or DOCX')
            }

            await sendProgress('Starting file processing...');
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            await sendProgress(`Parsing ${file.type === FILE_TYPES.PDF ? 'PDF' : file.type === FILE_TYPES.TXT ? 'TXT' : 'DOCX'}...`);
            const text = await parseDocument(buffer, file.type as FileType)
            await sendProgress('Text extraction complete');
            await sendResult({type: 'extracted_text', text: truncateText(text)});

            await sendProgress('Extracting primary selector information...');
            const primaryInsured = await streamExtractPrimaryInsured(
                text,
                (info) => sendProgress(info),
                (chunk) => sendLLMChunk(chunk)
            );

            await sendProgress('Finding insurance match...');
            const insuranceMatch = await findIdByFuzzyName(primaryInsured.name)

            await sendProgress('Processing complete!');
            await sendResult({
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
