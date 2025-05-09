import { InsuranceMatch, Insured } from './insurance'

export interface FileResult {
    fileName: string
    text: string | null
    insuranceMatch: InsuranceMatch | null
    error: string | null
    processingSteps: string[]
}

export interface UploadFormProps {
    onUpload: (files: File[]) => Promise<void>
    onRemoveFile?: (index: number) => void
    onManualSelect?: (fileIndex: number, insured: Insured) => void
    isProcessing?: boolean
    fileResults: FileResult[]
}

export interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void
    isDragging: boolean
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
}

export interface FileListProps {
    files: File[]
    fileResults: FileResult[]
    isProcessing: boolean
    expandedFiles: Set<number>
    onToggleExpand: (index: number) => void
    onRemoveFile: (index: number) => void
    onManualSelect?: (fileIndex: number, insured: Insured) => void
}

export interface FileListItemProps {
    file: File
    result: FileResult | undefined
    isProcessing: boolean
    isExpanded: boolean
    onToggleExpand: () => void
    onRemoveFile: () => void
    onManualSelect?: (insured: Insured) => void
} 