import { useState, useEffect } from 'react'
import { FILE_TYPES, FileType } from '@/types/files'

interface UseFileUploadProps {
    onRemoveFile?: (index: number) => void
    fileResultsLength: number
}

interface UseFileUploadReturn {
    files: File[]
    isDragging: boolean
    expandedFiles: Set<number>
    handleUpload: (onUpload: (files: File[]) => Promise<void>) => Promise<void>
    handleDragOver: (e: React.DragEvent) => void
    handleDragLeave: (e: React.DragEvent) => void
    handleDrop: (e: React.DragEvent) => void
    handleFilesSelected: (selectedFiles: File[]) => void
    handleRemoveFile: (index: number) => void
    handleToggleExpand: (index: number) => void
}

export function useFileUpload({ onRemoveFile, fileResultsLength }: UseFileUploadProps): UseFileUploadReturn {
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set())

    useEffect(() => {
        if (fileResultsLength === 0) {
            setFiles([])
            setExpandedFiles(new Set())
            // Reset the file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement
            if (fileInput) {
                fileInput.value = ''
            }
        }
    }, [fileResultsLength])

    const handleUpload = async (onUpload: (files: File[]) => Promise<void>) => {
        if (files.length === 0) return
        setExpandedFiles(new Set(files.map((_, index) => index)))
        await onUpload(files)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        
        const allowedTypes = [FILE_TYPES.PDF, FILE_TYPES.TXT, FILE_TYPES.DOCX] as const
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => allowedTypes.includes(file.type as FileType))
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles])
        }
    }

    const handleFilesSelected = (selectedFiles: File[]) => {
        const allowedTypes = [FILE_TYPES.PDF, FILE_TYPES.TXT, FILE_TYPES.DOCX] as const
        const filteredFiles = selectedFiles.filter(file => allowedTypes.includes(file.type as FileType))
        if (filteredFiles.length > 0) {
            setFiles(prev => [...prev, ...filteredFiles])
        }
    }

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setExpandedFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(index)
            return newSet
        })
        onRemoveFile?.(index)
        // Reset the file input when removing files
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    const handleToggleExpand = (index: number) => {
        setExpandedFiles(prev => {
            const newSet = new Set(prev)
            if (newSet.has(index)) {
                newSet.delete(index)
            } else {
                newSet.add(index)
            }
            return newSet
        })
    }

    return {
        files,
        isDragging,
        expandedFiles,
        handleUpload,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFilesSelected,
        handleRemoveFile,
        handleToggleExpand
    }
} 