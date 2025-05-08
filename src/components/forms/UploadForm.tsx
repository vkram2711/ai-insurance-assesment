'use client'

import { useState } from 'react'
import { PrimaryInsured } from '@/types/insurance'

export default function UploadForm() {
    const [file, setFile] = useState<File | null>(null)
    const [text, setText] = useState<string | null>(null)
    const [primaryInsured, setPrimaryInsured] = useState<PrimaryInsured | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async () => {
        if (!file) return

        setError(null)
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
            setPrimaryInsured(data.primaryInsured)
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        }
    }

    return (
        <div className="w-full max-w-md space-y-4">
            <div className="flex flex-col space-y-2">
                <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
                <button 
                    onClick={handleUpload}
                    disabled={!file}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Upload and Process
                </button>
            </div>

            {error && (
                <div className="p-4 text-red-700 bg-red-100 rounded-md">
                    {error}
                </div>
            )}

            {primaryInsured && (
                <div className="p-4 bg-green-50 rounded-md">
                    <h3 className="font-semibold text-green-800 mb-2">Primary Insured Information</h3>
                    <p className="text-green-700">Name: {primaryInsured.name}</p>
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
