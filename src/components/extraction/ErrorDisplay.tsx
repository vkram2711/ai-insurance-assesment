interface ErrorDisplayProps {
    error: string
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
    return (
        <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error Occurred</h4>
            </div>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
    )
} 