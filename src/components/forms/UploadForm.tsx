'use client'

import {UploadFormProps} from '@/types/upload'
import {useFileUpload} from '@/hooks/useFileUpload'
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
        <div className="w-full grid grid-rows-[auto_1fr] gap-4">
            <div>
                <FileUploader
                    onFilesSelected={handleFilesSelected}
                    isDragging={isDragging}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                />
            </div>

            <div className={`grid grid-rows-[1fr_auto] gap-4 transition-all duration-400 ease-out ${
                files.length > 0 ? 'opacity-100' : 'opacity-0'
            }`}>
                <FileList
                    files={files}
                    fileResults={fileResults}
                    isProcessing={isProcessing}
                    expandedFiles={expandedFiles}
                    onToggleExpand={handleToggleExpand}
                    onRemoveFile={handleRemoveFile}
                    onManualSelect={onManualSelect}
                />
                <div className="transition-all duration-400 ease-out">
                    <button
                        onClick={() => handleUpload(onUpload)}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isProcessing ? 'Processing...' : `Process ${files.length} file${files.length > 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    )
}
