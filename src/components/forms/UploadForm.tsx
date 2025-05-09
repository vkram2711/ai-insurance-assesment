'use client'

import { useState, useCallback } from 'react'
import { UploadFormProps } from '@/types/upload'
import { useFileUpload } from '@/hooks/useFileUpload'
import { FileResult } from '@/types/upload'
import FileUploader from '@/components/file-upload/FileUploader'
import FileList from '@/components/lists/FileList'

export default function UploadForm({ 
    onUpload, 
    onRemoveFile, 
    onManualSelect, 
    isProcessing = false, 
    fileResults 
}: UploadFormProps) {
    const {
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
    } = useFileUpload({
        onRemoveFile,
        fileResultsLength: fileResults.length
    })

    return (
        <div className="w-full space-y-4">
            <FileUploader
                onFilesSelected={handleFilesSelected}
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            />

            {files.length > 0 && (
                <>
                    <FileList
                        files={files}
                        fileResults={fileResults}
                        isProcessing={isProcessing}
                        expandedFiles={expandedFiles}
                        onToggleExpand={handleToggleExpand}
                        onRemoveFile={handleRemoveFile}
                        onManualSelect={onManualSelect}
                    />
                    <button 
                        onClick={() => handleUpload(onUpload)}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : `Process ${files.length} file${files.length > 1 ? 's' : ''}`}
                    </button>
                </>
            )}
        </div>
    )
}
