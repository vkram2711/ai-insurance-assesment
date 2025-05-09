'use client'

import { FileListItemProps } from '@/types/upload'
import FileStatus from '@/components/FileStatus'
import ExtractionResults from '@/components/extraction/ExtractionResults'

export default function FileListItem({
    file,
    result,
    isProcessing,
    isExpanded,
    onToggleExpand,
    onRemoveFile,
    onManualSelect
}: FileListItemProps) {
    const hasResults = result && (result.text || result.insuranceMatch || result.error || result.processingSteps.length > 0)
    const currentStep = result?.processingSteps?.length ? result.processingSteps[result.processingSteps.length - 1] : undefined

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-all duration-400 ease-out">
            <div className="flex items-center justify-between p-4 animate-fadeIn">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onToggleExpand}
                        className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 ${hasResults ? '' : 'invisible'}`}
                    >
                        <svg 
                            className={`h-5 w-5 transform transition-transform duration-300 ease-out ${isExpanded ? 'rotate-90' : ''}`}
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{file.name}</span>
                        <FileStatus 
                            isProcessing={isProcessing}
                            hasError={!!result?.error}
                            hasResults={!!result?.insuranceMatch}
                            needsManualSelection={!!result?.text && !result?.insuranceMatch && !result?.error && !isProcessing}
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {!isExpanded && result && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-opacity duration-200">
                            {result.error ? (
                                <span className="text-red-600 dark:text-red-400">{result.error}</span>
                            ) : result.insuranceMatch ? (
                                <span className="text-green-600 dark:text-green-400">
                                    {result.insuranceMatch.isManual ? (
                                        <>Manual: {result.insuranceMatch.insured.name}</>
                                    ) : (
                                        <>Match: {result.insuranceMatch.insured.name} ({Math.round(result.insuranceMatch.score * 100)}%)</>
                                    )}
                                </span>
                            ) : result.processingSteps.length > 0 ? (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {currentStep}
                                </span>
                            ) : null}
                        </div>
                    )}
                    <button
                        onClick={onRemoveFile}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div 
                className={`grid transition-all duration-400 ease-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                {hasResults && result && (
                    <div className="overflow-hidden">
                        <div className="p-4">
                            <ExtractionResults
                                text={result.text}
                                insuranceMatch={result.insuranceMatch}
                                error={result.error}
                                isProcessing={isProcessing}
                                processingSteps={result.processingSteps}
                                onManualSelect={onManualSelect}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 