import { InsuranceMatch, Insured } from '@/types/insurance'
import MatchScore from './MatchScore'
import InsuredSelector from '@/components/selector/InsuredSelector'
import { useState, useEffect } from 'react'

interface ExtractionResultsProps {
    text: string | null
    insuranceMatch: InsuranceMatch | null
    error: string | null
    isProcessing: boolean
    processingSteps: string[]
    onManualSelect?: (insured: Insured) => void
}

export default function ExtractionResults({ 
    text, 
    insuranceMatch, 
    error, 
    isProcessing,
    processingSteps,
    onManualSelect
}: ExtractionResultsProps) {
    const [llmSteps, setLlmSteps] = useState<string[]>([]);
    const [llmResponse, setLlmResponse] = useState<any>(null);

    useEffect(() => {
        // Reset state when processing starts
        if (isProcessing) {
            setLlmSteps([]);
            setLlmResponse(null);
        }
    }, [isProcessing]);

    // Handle LLM processing steps
    useEffect(() => {
        const lastStep = processingSteps[processingSteps.length - 1];
        if (lastStep?.startsWith('LLM is processing:')) {
            const parts = lastStep.split('{');
            if (parts.length === 2) {
                const processingInfo = parts[0].trim();
                const jsonStr = '{' + parts[1];

                // Extract the processing step first
                const newStep = processingInfo
                    .replace('LLM is processing:', '')
                    .trim()
                    .split('...')
                    .filter(step => step.trim())
                    .pop() || '';

                // Only add the step if it's not already in the list
                setLlmSteps(prev => {
                    if (prev.includes(newStep)) {
                        return prev;
                    }
                    return [...prev, newStep];
                });

                // Try to parse JSON, but don't fail if it's incomplete
                try {
                    // Check if the JSON string is complete
                    if (jsonStr.trim().endsWith('}')) {
                        const json = JSON.parse(jsonStr);
                        setLlmResponse(json);
                    }
                } catch (error) {
                    // Silently ignore JSON parsing errors during streaming
                    console.debug('Incomplete JSON during streaming:', error);
                }
            }
        }
    }, [processingSteps]);

    if (!text && !insuranceMatch && !isProcessing && !error) {
        return (
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Results</h3>
                <p className="text-gray-500 dark:text-gray-400 italic">Upload a PDF to see results</p>
            </div>
        )
    }

    const formatLLMResponse = (step: string) => {
        if (!step.startsWith('LLM is processing:')) return step;

        return (
            <div className="space-y-2">
                <div className="flex items-start space-x-2">
                    <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Processing with AI</div>
                        <div className="mt-1 space-y-1">
                            {llmSteps.map((step, index) => (
                                <div key={index} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500"></div>
                                    <span>{step.trim()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {llmResponse && (
                    <pre className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {JSON.stringify(llmResponse, null, 2)}
                    </pre>
                )}
            </div>
        );
    };

    const formatProcessingStep = (step: string) => {
        if (step.startsWith('Processing document in')) {
            const match = step.match(/Processing document in (\d+) chunks?/);
            if (match) {
                const numChunks = match[1];
                return (
                    <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span>Document split into {numChunks} {numChunks === '1' ? 'chunk' : 'chunks'}</span>
                    </div>
                );
            }
        }
        
        if (step.startsWith('Processing chunk')) {
            const match = step.match(/Processing chunk (\d+) of (\d+)/);
            if (match) {
                const [_, current, total] = match;
                return (
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                        <span>Processing chunk {current} of {total}</span>
                    </div>
                );
            }
        }

        return step;
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Processing Results</h3>
            
            {/* Processing Steps with Inline Results */}
            <div className="space-y-4">
                {processingSteps.map((step, index) => (
                    <div key={index} className="space-y-2">
                        <div className={`text-sm ${
                            step.startsWith('Processing document in') 
                                ? 'bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                : step.startsWith('Processing chunk') 
                                ? 'bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                : step.startsWith('LLM is processing:') 
                                ? 'bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300'
                        }`}>
                            {step.startsWith('LLM is processing:') 
                                ? formatLLMResponse(step)
                                : formatProcessingStep(step)
                            }
                        </div>
                        {/* Show extracted text after text extraction is complete */}
                        {step === 'Text extraction complete' && text && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {text}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error Occurred</h4>
                    </div>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Insurance Match - only show if we have a match and no error */}
            {!error && !isProcessing && (
                <div className="mt-6 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg p-4">
                    {insuranceMatch ? (
                        <>
                            <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">
                                {insuranceMatch.isManual ? 'Manually Selected Insured' : 'Insurance Match Found'}
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                            {insuranceMatch.insured.name}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-500">
                                            ID: {insuranceMatch.insured.internalId}
                                        </p>
                                    </div>
                                    {!insuranceMatch.isManual && <MatchScore score={insuranceMatch.score} />}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">No Automatic Match Found</h4>
                            <div className="space-y-3">
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                    Please select the correct insured from the list below:
                                </p>
                                <InsuredSelector onSelect={onManualSelect || (() => {})} />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
} 