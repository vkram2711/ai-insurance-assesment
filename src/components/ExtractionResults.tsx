import { InsuranceMatch, Insured } from '@/types/insurance'
import MatchScore from './MatchScore'
import InsuredSelector from './InsuredSelector'

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
    if (!text && !insuranceMatch && !isProcessing && !error) {
        return (
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Results</h3>
                <p className="text-gray-500 dark:text-gray-400 italic">Upload a PDF to see results</p>
            </div>
        )
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Processing Results</h3>
            
            {/* Processing Steps with Inline Results */}
            <div className="space-y-4">
                {processingSteps.map((step, index) => (
                    <div key={index} className="space-y-2">
                        <div className={`text-sm ${
                            step.startsWith('LLM is processing:') 
                                ? 'bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono'
                                : 'text-gray-700 dark:text-gray-300'
                        }`}>
                            {step}
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
            {!error && (
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
                    ) : !isProcessing && text && (
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