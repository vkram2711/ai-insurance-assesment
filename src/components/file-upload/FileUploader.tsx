'use client'

import { FileUploaderProps } from '@/types/upload'

export default function FileUploader({ 
    onFilesSelected, 
    isDragging, 
    onDragOver, 
    onDragLeave, 
    onDrop 
}: FileUploaderProps) {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            onFilesSelected(files)
        }
    }

    return (
        <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <input 
                type="file" 
                accept=".pdf,.txt,.docx" 
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
                            Upload files
                        </span>
                        {' '}or drag and drop
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, TXT, or DOCX up to 10MB
                    </p>
                </div>
            </label>
        </div>
    )
} 