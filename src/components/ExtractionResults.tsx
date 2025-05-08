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
    if (error) {
        return (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
                <p className="text-red-600">{error}</p>
            </div>
        )
    }

    if (!text && !insuranceMatch && !isProcessing) {
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
                        <div className="text-sm text-gray-700">
                            {step}
                        </div>
                        {/* Show extracted text right after parsing step */}
                        {step.includes('Parsing PDF') && text && (
                            <div className="ml-4 bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                                {text}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Insurance Match */}
            {insuranceMatch && (
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