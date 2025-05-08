import { parseDocument, FILE_TYPES } from '../parser';
import { DocumentError } from '@/types/errors';
import mammoth from 'mammoth';

// Mock mammoth
jest.mock('mammoth', () => ({
    extractRawText: jest.fn()
}));

describe('Document Parser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('parseDocument', () => {
        it('should throw error for unsupported file type', async () => {
            const buffer = Buffer.from('test');
            await expect(parseDocument(buffer, 'unsupported/type'))
                .rejects
                .toThrow(DocumentError);
        });

        it('should throw error for empty buffer', async () => {
            const buffer = Buffer.from('');
            await expect(parseDocument(buffer, FILE_TYPES.TXT))
                .rejects
                .toThrow(DocumentError);
        });
    });

    describe('TXT parsing', () => {
        it('should successfully parse TXT file', async () => {
            const mockText = 'Sample text content';
            const buffer = Buffer.from(mockText);
            const result = await parseDocument(buffer, FILE_TYPES.TXT);
            expect(result).toBe(mockText);
        });

        it('should handle empty TXT file', async () => {
            const buffer = Buffer.from('');
            await expect(parseDocument(buffer, FILE_TYPES.TXT))
                .rejects
                .toThrow(DocumentError);
        });

        it('should handle TXT file with only whitespace', async () => {
            const buffer = Buffer.from('   \n\t   ');
            await expect(parseDocument(buffer, FILE_TYPES.TXT))
                .rejects
                .toThrow(DocumentError);
        });
    });

    describe('DOCX parsing', () => {
        it('should successfully parse DOCX file', async () => {
            const mockText = 'Sample DOCX content';
            (mammoth.extractRawText as jest.Mock).mockResolvedValue({
                value: mockText
            });

            const buffer = Buffer.from('mock docx content');
            const result = await parseDocument(buffer, FILE_TYPES.DOCX);
            expect(result).toBe(mockText);
        });

        it('should handle DOCX parsing error', async () => {
            (mammoth.extractRawText as jest.Mock).mockRejectedValue(
                new Error('DOCX parsing failed')
            );

            const buffer = Buffer.from('invalid docx content');
            await expect(parseDocument(buffer, FILE_TYPES.DOCX))
                .rejects
                .toThrow(DocumentError);
        });

        it('should handle empty DOCX content', async () => {
            (mammoth.extractRawText as jest.Mock).mockResolvedValue({
                value: ''
            });

            const buffer = Buffer.from('empty docx content');
            await expect(parseDocument(buffer, FILE_TYPES.DOCX))
                .rejects
                .toThrow(DocumentError);
        });
    });
}); 