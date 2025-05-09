import { useState, useEffect } from 'react'
import LLMProcessing from './LLMProcessing'

interface ProcessingStepsProps {
    steps: string[]
    text: string | null
}

export default function ProcessingSteps({ steps, text }: ProcessingStepsProps) {
    const [llmSteps, setLlmSteps] = useState<string[]>([])
    const [llmResponse, setLlmResponse] = useState<any>(null)
    const [streamingText, setStreamingText] = useState<string>('')

    // Handle LLM processing steps
    useEffect(() => {
        const lastStep = steps[steps.length - 1]
        if (lastStep?.startsWith('LLM is processing:')) {
            const parts = lastStep.split('{')
            if (parts.length === 2) {
                const processingInfo = parts[0].trim()
                const jsonStr = '{' + parts[1]

                // Extract the processing step first
                const newStep = processingInfo
                    .replace('LLM is processing:', '')
                    .trim()
                    .split('...')
                    .filter(step => step.trim())
                    .pop() || ''

                // Only add the step if it's not already in the list
                setLlmSteps(prev => {
                    if (prev.includes(newStep)) {
                        return prev
                    }
                    return [...prev, newStep]
                })

                // Update streaming text
                setStreamingText(jsonStr)

                // Try to parse JSON, but don't fail if it's incomplete
                try {
                    // Check if the JSON string is complete
                    if (jsonStr.trim().endsWith('}')) {
                        const json = JSON.parse(jsonStr)
                        setLlmResponse(json)
                    }
                } catch (error) {
                    // Silently ignore JSON parsing errors during streaming
                }
            }
        }
    }, [steps])

    const formatProcessingStep = (step: string) => {
        if (step.startsWith('Processing document in')) {
            const match = step.match(/Processing document in (\d+) chunks?/)
            if (match) {
                const numChunks = match[1]
                return (
                    <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span>Document split into {numChunks} {numChunks === '1' ? 'chunk' : 'chunks'}</span>
                    </div>
                )
            }
        }
        
        if (step.startsWith('Processing chunk')) {
            const match = step.match(/Processing chunk (\d+) of (\d+)/)
            if (match) {
                const [_, current, total] = match
                return (
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                        <span>Processing chunk {current} of {total}</span>
                    </div>
                )
            }
        }

        return step
    }

    return (
        <div className="space-y-4">
            {steps.map((step, index) => (
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
                            ? <LLMProcessing 
                                step={step} 
                                steps={llmSteps} 
                                response={llmResponse} 
                                streamingText={streamingText}
                              />
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
    )
} 