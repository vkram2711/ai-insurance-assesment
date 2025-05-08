// File type constants
export const FILE_TYPES = {
    PDF: 'application/pdf',
    TXT: 'text/plain',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES]; 