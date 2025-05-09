import { useState } from 'react'
import { InsuranceMatch, Insured } from '@/types/insurance'

export interface FileResult {
    fileName: string
    text: string | null
    insuranceMatch: InsuranceMatch | null
    error: string | null
    processingSteps: string[]
}

export function useFileProcessing() {
    const [fileResults, setFileResults] = useState<FileResult[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    const processFiles = async (files: File[]) => {
        setIsProcessing(true)
        setFileResults([])

        // Initialize all file results first
        const initialResults = files.map(file => ({
            fileName: file.name,
            text: null,
            insuranceMatch: null,
            error: null,
            processingSteps: []
        }))
        setFileResults(initialResults)

        // Process files sequentially
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const formData = new FormData()
            formData.append('file', file)

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                const reader = response.body?.getReader()
                if (!reader) throw new Error('Failed to start processing')

                while (true) {
                    const {done, value} = await reader.read()
                    if (done) break

                    const chunk = new TextDecoder().decode(value)
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(6))

                            setFileResults(prev => {
                                const newResults = [...prev]
                                const currentResult = {...newResults[i]}

                                switch (data.type) {
                                    case 'progress':
                                        currentResult.processingSteps = [...currentResult.processingSteps, data.message]
                                        break
                                    case 'llm_chunk':
                                        // Find the last LLM processing step or add a new one
                                        const lastLLMStepIndex = currentResult.processingSteps.findLastIndex(step => 
                                            step.startsWith('LLM is processing:')
                                        )
                                        
                                        if (lastLLMStepIndex === -1) {
                                            // No existing LLM step, add a new one
                                            currentResult.processingSteps = [...currentResult.processingSteps, `LLM is processing: ${data.chunk}`]
                                        } else {
                                            // Update the existing LLM step with the complete accumulated content
                                            const updatedSteps = [...currentResult.processingSteps]
                                            updatedSteps[lastLLMStepIndex] = `LLM is processing: ${data.chunk}`
                                            currentResult.processingSteps = updatedSteps
                                        }
                                        break
                                    case 'result':
                                        if (data.data.type === 'extracted_text') {
                                            currentResult.text = data.data.text
                                        } else if (data.data.insuranceMatch) {
                                            currentResult.insuranceMatch = data.data.insuranceMatch
                                        }
                                        break
                                    case 'error':
                                        currentResult.error = data.error
                                        break
                                }

                                newResults[i] = currentResult
                                return newResults
                            })
                        }
                    }
                }
            } catch (err: any) {
                setFileResults(prev => {
                    const newResults = [...prev]
                    newResults[i] = {
                        ...newResults[i],
                        error: err.message || 'An error occurred'
                    }
                    return newResults
                })
            }
        }

        setIsProcessing(false)
    }

    const removeFile = (index: number) => {
        setFileResults(prev => prev.filter((_, i) => i !== index))
    }

    const handleManualSelect = (fileIndex: number, insured: Insured) => {
        setFileResults(prev => {
            const newResults = [...prev]
            newResults[fileIndex] = {
                ...newResults[fileIndex],
                insuranceMatch: {
                    insured,
                    score: 1.0,
                    isManual: true
                }
            }
            return newResults
        })
    }

    return {
        fileResults,
        isProcessing,
        processFiles,
        removeFile,
        handleManualSelect
    }
} 