import { InsuranceMatch } from '@/types/insurance'
import MatchScore from './MatchScore'

interface ExtractionResultsProps {
    text: string | null
    insuranceMatch: InsuranceMatch | null
    error: string | null
    isProcessing: boolean
}

export default function ExtractionResults({ text, insuranceMatch, error, isProcessing }: ExtractionResultsProps) {
    if (isProcessing) {
        return (
            <div className="p-4 bg-blue-50 rounded-md">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700">Processing document...</span>
                </div>
            </div>
        )
    }

    if (error) {
        // Determine error type and style based on error message
        const isNetworkError = error.toLowerCase().includes('network');
        const isTokenError = error.toLowerCase().includes('token');
        const isValidationError = error.toLowerCase().includes('validation') || error.toLowerCase().includes('invalid');
        
        const errorStyle = isNetworkError 
            ? 'bg-orange-50 text-orange-700 border-orange-200'
            : isTokenError
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : isValidationError
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-red-50 text-red-700 border-red-200';

        return (
            <div className={`p-4 rounded-md border ${errorStyle}`}>
                <div className="flex items-start space-x-2">
                    <svg 
                        className="h-5 w-5 flex-shrink-0" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                            clipRule="evenodd" 
                        />
                    </svg>
                    <div>
                        <h3 className="font-medium mb-1">
                            {isNetworkError 
                                ? 'Network Error'
                                : isTokenError
                                    ? 'Token Limit Exceeded'
                                    : isValidationError
                                        ? 'Validation Error'
                                        : 'Error Processing Document'}
                        </h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!text && !insuranceMatch) {
        return null
    }

    return (
        <div className="w-full max-w-md space-y-4">
            {insuranceMatch && (
                <div className="p-4 bg-green-50 rounded-md space-y-4">
                    <h3 className="font-semibold text-green-800 mb-2">Insurance Match</h3>
                    <div className="space-y-2">
                        <p className="text-green-700">Name: {insuranceMatch.insured.name}</p>
                        <p className="text-green-700">Internal ID: {insuranceMatch.insured.internalId}</p>
                    </div>
                    <MatchScore score={insuranceMatch.score} />
                </div>
            )}

            {text && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Extracted Text</h3>
                    <pre className="p-4 bg-gray-50 rounded-md overflow-auto max-h-96 text-sm">
                        {text}
                    </pre>
                </div>
            )}
        </div>
    )
} 