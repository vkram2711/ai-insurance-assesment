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

    const handleUpload = async (file: File) => {
        setIsProcessing(true)
        setError(null)
        setText(null)
        setInsuranceMatch(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to process PDF')
            }

            setText(data.text)
            setInsuranceMatch(data.insuranceMatch)
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
                    />
                </div>
            </div>
        </main>
    )
}
