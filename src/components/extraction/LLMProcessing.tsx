import { useEffect, useState } from 'react'

interface LLMProcessingProps {
    step: string
    steps: string[]
    response: any
    accumulatedChunks: string
    isTransitioning: boolean
}

export default function LLMProcessing({ step, steps, response, accumulatedChunks, isTransitioning }: LLMProcessingProps) {
    const [latestChunk, setLatestChunk] = useState<string>('')

    useEffect(() => {
        // Extract the latest chunk from the step
        const chunk = step.replace('LLM is processing:', '').trim()
        setLatestChunk(chunk)
    }, [step])

    if (!latestChunk) return null

    return (
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                    <span>Processing chunk {latestChunk}</span>
                </div>
                {response && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                )}
                {response?.name && response.name !== 'undefined' && (
                    <div className="mt-2 flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Found: {response.name}</span>
                    </div>
                )}
            </div>
        </div>
    )
} 