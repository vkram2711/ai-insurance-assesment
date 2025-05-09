'use client'

import { FileListProps } from '@/types/upload'
import FileListItem from '@/components/lists/FileListItem'

export default function FileList({
    files,
    fileResults,
    isProcessing,
    expandedFiles,
    onToggleExpand,
    onRemoveFile,
    onManualSelect
}: FileListProps) {
    const expandAll = () => {
        files.forEach((_, index) => onToggleExpand(index))
    }

    const collapseAll = () => {
        expandedFiles.forEach(index => onToggleExpand(index))
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end space-x-2">
                <button
                    onClick={expandAll}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                    Expand All
                </button>
                <button
                    onClick={collapseAll}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                    Collapse All
                </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                {files.map((file, index) => (
                    <FileListItem
                        key={index}
                        file={file}
                        result={fileResults[index]}
                        isProcessing={isProcessing && index === fileResults.findIndex(r => r.fileName === file.name)}
                        isExpanded={expandedFiles.has(index)}
                        onToggleExpand={() => onToggleExpand(index)}
                        onRemoveFile={() => onRemoveFile(index)}
                        onManualSelect={onManualSelect ? (insured) => onManualSelect(index, insured) : undefined}
                    />
                ))}
            </div>
        </div>
    )
} 