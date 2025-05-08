import { InsuranceMatch } from '@/types/insurance'
import MatchScore from './MatchScore'

interface ExtractionResultsProps {
    text: string | null
    insuranceMatch: InsuranceMatch | null
    error: string | null
    isProcessing: boolean
    processingSteps: string[]
}

export default function ExtractionResults({ 
    text, 
    insuranceMatch, 
    error, 
    isProcessing,
    processingSteps 
}: ExtractionResultsProps) {
    if (!text && !insuranceMatch && !isProcessing && !error) {
        return (
            <div className="w-full bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Results</h3>
                <p className="text-gray-500 italic">Upload a PDF to see results</p>
            </div>
        )
    }

    return (
        <div className="w-full bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold mb-2">Processing Results</h3>
            
            {/* Processing Steps with Inline Results */}
            <div className="space-y-4">
                {processingSteps.map((step, index) => (
                    <div key={index} className="space-y-2">
                        <div className={`text-sm ${
                            step.startsWith('LLM is processing:') 
                                ? 'bg-blue-50 p-3 rounded border border-blue-100 text-blue-700 font-mono'
                                : 'text-gray-700'
                        }`}>
                            {step}
                        </div>
                        {/* Show extracted text right after parsing step */}
                        {step.includes('Parsing PDF') && text && (
                            <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                                {text}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <h4 className="text-sm font-medium text-red-800">Error Occurred</h4>
                    </div>
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Insurance Match - only show if we have a match and no error */}
            {insuranceMatch && !error && (
                <div className="mt-6 bg-green-50 border border-green-100 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-3">Insurance Match Found</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-green-700">
                                    {insuranceMatch.insured.name}
                                </p>
                                <p className="text-xs text-green-600">
                                    ID: {insuranceMatch.insured.internalId}
                                </p>
                            </div>
                            <MatchScore score={insuranceMatch.score} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 