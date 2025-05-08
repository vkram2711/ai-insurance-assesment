'use client'

import { useState } from 'react'
import UploadForm from '@/components/forms/UploadForm'
import { InsuranceMatch } from '@/types/insurance'
import ExtractionResults from '@/components/ExtractionResults'

export default function HomePage() {
    const [text, setText] = useState<string | null>(null)
    const [insuranceMatch, setInsuranceMatch] = useState<InsuranceMatch | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingSteps, setProcessingSteps] = useState<string[]>([])

    const handleUpload = async (file: File) => {
        setIsProcessing(true)
        setError(null)
        setText(null)
        setInsuranceMatch(null)
        setProcessingSteps([])

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
                        
                        switch (data.type) {
                            case 'progress':
                                setProcessingSteps(prev => [...prev, data.message])
                                break
                            case 'llm_update':
                                setProcessingSteps(prev => {
                                    const newSteps = [...prev];
                                    // Find the last LLM update or add a new one
                                    const lastLLMIndex = newSteps.findIndex(step => step.startsWith('LLM is processing:'));
                                    if (lastLLMIndex !== -1) {
                                        newSteps[lastLLMIndex] = `LLM is processing: ${data.message}`;
                                    } else {
                                        newSteps.push(`LLM is processing: ${data.message}`);
                                    }
                                    return newSteps;
                                });
                                break;
                            case 'result':
                                if (data.data.text) {
                                    setText(data.data.text);
                                }
                                if (data.data.insuranceMatch) {
                                    setInsuranceMatch(data.data.insuranceMatch);
                                }
                                break
                            case 'error':
                                throw new Error(data.error)
                        }
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold mb-8">PDF Upload and Parse</h1>
            
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <UploadForm onUpload={handleUpload} isProcessing={isProcessing} />
                </div>

                <div>
                    <ExtractionResults 
                        text={text}
                        insuranceMatch={insuranceMatch}
                        error={error}
                        isProcessing={isProcessing}
                        processingSteps={processingSteps}
                    />
                </div>
            </div>
        </main>
    )
}
