import { InsuranceMatch, Insured } from '@/types/insurance'
import ProcessingSteps from './extraction/ProcessingSteps'
import ErrorDisplay from './extraction/ErrorDisplay'
import InsuranceMatchDisplay from './extraction/InsuranceMatchDisplay'
import ManualSelection from './extraction/ManualSelection'

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
            <ProcessingSteps steps={processingSteps} text={text} />

            {/* Error Display */}
            {error && <ErrorDisplay error={error} />}

            {/* Insurance Match - only show if we have a match and no error */}
            {!error && !isProcessing && (
                <div className="mt-6 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg p-4">
                    {insuranceMatch ? (
                        <InsuranceMatchDisplay match={insuranceMatch} />
                    ) : (
                        <ManualSelection onSelect={onManualSelect || (() => {})} />
                    )}
                </div>
            )}
        </div>
    )
} 