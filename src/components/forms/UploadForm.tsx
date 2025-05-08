'use client'

import { useState } from 'react'

interface UploadFormProps {
    onUpload: (file: File) => Promise<void>;
    isProcessing?: boolean;
}

export default function UploadForm({ onUpload, isProcessing = false }: UploadFormProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleUpload = async () => {
        if (!file) return
        await onUpload(file)
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
        
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile)
        }
    }

    return (
        <div className="w-full max-w-md space-y-4">
            <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                />
                <label 
                    htmlFor="file-upload"
                    className="cursor-pointer"
                >
                    <div className="space-y-2">
                        <svg 
                            className="mx-auto h-12 w-12 text-gray-400" 
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
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">
                                Upload a PDF file
                            </span>
                            {' '}or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">
                            PDF up to 10MB
                        </p>
                    </div>
                </label>
            </div>

            {file && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button 
                        onClick={handleUpload}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Process'}
                    </button>
                </div>
            )}
        </div>
    )
}
