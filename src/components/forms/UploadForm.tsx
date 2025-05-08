'use client'

import { useState } from 'react'

export default function UploadForm() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<string | null>(null)

    const handleUpload = async () => {
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })

        const data = await res.json()
        setResult(data.text)
    }

    return (
        <div>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button onClick={handleUpload}>Upload</button>
            {result && <pre>{result}</pre>}
        </div>
    )
}
