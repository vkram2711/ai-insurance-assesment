'use client'

import { useState } from 'react'
import UploadForm from '@/components/forms/UploadForm'
import { InsuranceMatch, Insured } from '@/types/insurance'

interface FileResult {
    fileName: string;
    text: string | null;
    insuranceMatch: InsuranceMatch | null;
    error: string | null;
    processingSteps: string[];
}

export default function HomePage() {
    const [fileResults, setFileResults] = useState<FileResult[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    const handleUpload = async (files: File[]) => {
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
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = new TextDecoder().decode(value)
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(6))
                            
                            setFileResults(prev => {
                                const newResults = [...prev]
                                const currentResult = { ...newResults[i] }

                                switch (data.type) {
                                    case 'progress':
                                        currentResult.processingSteps = [...currentResult.processingSteps, data.message]
                                        break
                                    case 'llm_update':
                                        currentResult.processingSteps = currentResult.processingSteps.map(step => 
                                            step.startsWith('LLM is processing:') 
                                                ? `LLM is processing: ${data.message}`
                                                : step
                                        )
                                        if (!currentResult.processingSteps.some(step => step.startsWith('LLM is processing:'))) {
                                            currentResult.processingSteps.push(`LLM is processing: ${data.message}`)
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

    const handleRemoveFile = (index: number) => {
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

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold mb-8">PDF Upload and Parse</h1>
            
            <div className="w-full max-w-4xl">
                <UploadForm 
                    onUpload={handleUpload} 
                    onRemoveFile={handleRemoveFile}
                    onManualSelect={handleManualSelect}
                    isProcessing={isProcessing}
                    fileResults={fileResults}
                />
            </div>
        </main>
    )
}
