'use client'

import { FileListProps } from '@/types/upload'
import FileListItem from '@/components/lists/FileListItem'
import { useState } from 'react'

export default function FileList({
    files,
    fileResults,
    isProcessing,
    expandedFiles,
    onToggleExpand,
    onRemoveFile,
    onManualSelect
}: FileListProps) {
    const [removingIndex, setRemovingIndex] = useState<number | null>(null)

    const expandAll = () => {
        files.forEach((_, index) => onToggleExpand(index))
    }

    const collapseAll = () => {
        expandedFiles.forEach(index => onToggleExpand(index))
    }

    const handleRemoveFile = (index: number) => {
        setRemovingIndex(index)
        onRemoveFile(index)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end space-x-2">
                <button
                    onClick={expandAll}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                >
                    Expand All
                </button>
                <button
                    onClick={collapseAll}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                >
                    Collapse All
                </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                <div className="grid grid-rows-1 gap-0">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-400 ease-out ${
                                removingIndex === index ? 'animate-slideOut' : 'animate-slideIn'
                            }`}
                            style={{ 
                                animationDelay: `${index * 50}ms`,
                                transformOrigin: 'center',
                                willChange: 'transform, opacity',
                                position: 'relative',
                                zIndex: removingIndex === index ? 1 : 0
                            }}
                        >
                            <FileListItem
                                file={file}
                                result={fileResults[index]}
                                isProcessing={isProcessing && index === fileResults.findIndex(r => r.fileName === file.name)}
                                isExpanded={expandedFiles.has(index)}
                                onToggleExpand={() => onToggleExpand(index)}
                                onRemoveFile={() => handleRemoveFile(index)}
                                onManualSelect={onManualSelect ? (insured) => onManualSelect(index, insured) : undefined}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
} 