'use client'

import { useState } from 'react'
import { InsuranceMatch } from '@/types/insurance'
import ExtractionResults from '@/components/ExtractionResults'
import FileStatus from '@/components/FileStatus'

interface FileResult {
    fileName: string;
    text: string | null;
    insuranceMatch: InsuranceMatch | null;
    error: string | null;
    processingSteps: string[];
}

interface UploadFormProps {
    onUpload: (files: File[]) => Promise<void>;
    isProcessing?: boolean;
    fileResults: FileResult[];
}

export default function UploadForm({ onUpload, isProcessing = false, fileResults }: UploadFormProps) {
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set())

    const handleUpload = async () => {
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
        
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf')
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []).filter(file => file.type === 'application/pdf')
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setExpandedFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(index)
            return newSet
        })
    }

    const toggleExpand = (index: number) => {
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

    return (
        <div className="w-full space-y-4">
            <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    multiple
                />
                <label 
                    htmlFor="file-upload"
                    className="cursor-pointer"
                >
                    <div className="space-y-2">
                        <svg 
                            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" 
                            stroke="currentColor" 
                            fill="none" 
                            viewBox="0 0 48 48" 
                            aria-hidden="true"
                        >
                            <path 
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                                strokeWidth={2} 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </svg>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                Upload PDF files
                            </span>
                            {' '}or drag and drop
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF up to 10MB
                        </p>
                    </div>
                </label>
            </div>

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                        {files.map((file, index) => {
                            const result = fileResults[index]
                            const isExpanded = expandedFiles.has(index)
                            const hasResults = result && (result.text || result.insuranceMatch || result.error || result.processingSteps.length > 0)

                            return (
                                <div key={index} className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => toggleExpand(index)}
                                                className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${hasResults ? '' : 'invisible'}`}
                                            >
                                                <svg 
                                                    className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                    viewBox="0 0 20 20" 
                                                    fill="currentColor"
                                                >
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">{file.name}</span>
                                                <FileStatus 
                                                    isProcessing={isProcessing && index === fileResults.findIndex(r => r.fileName === file.name)}
                                                    hasError={!!result?.error}
                                                    hasResults={!!result?.insuranceMatch}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    {isExpanded && result && (
                                        <div className="p-4 bg-white dark:bg-gray-800">
                                            <ExtractionResults 
                                                text={result.text}
                                                insuranceMatch={result.insuranceMatch}
                                                error={result.error}
                                                isProcessing={isProcessing}
                                                processingSteps={result.processingSteps}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <button 
                        onClick={handleUpload}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : `Process ${files.length} file${files.length > 1 ? 's' : ''}`}
                    </button>
                </div>
            )}
        </div>
    )
}
