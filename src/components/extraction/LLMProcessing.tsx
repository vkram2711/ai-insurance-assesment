interface LLMProcessingProps {
    step: string
    steps: string[]
    response: any
}

export default function LLMProcessing({ step, steps, response }: LLMProcessingProps) {
    if (!step.startsWith('LLM is processing:')) return null

    return (
        <div className="space-y-2">
            <div className="flex items-start space-x-2">
                <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Processing with AI</div>
                    <div className="mt-1 space-y-1">
                        {steps.map((step, index) => (
                            <div key={index} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500"></div>
                                <span>{step.trim()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {response && (
                <pre className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(response, null, 2)}
                </pre>
            )}
        </div>
    )
} 