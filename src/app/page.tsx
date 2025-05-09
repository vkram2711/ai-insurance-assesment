'use client'

import UploadForm from '@/components/forms/UploadForm'
import PageHeader from '@/components/layout/PageHeader'
import FileProcessingContainer from '@/components/layout/FileProcessingContainer'
import { useFileProcessing } from '@/hooks/useFileProcessing'

export default function HomePage() {
    const {
        fileResults,
        isProcessing,
        processFiles,
        removeFile,
        handleManualSelect
    } = useFileProcessing()

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
            <PageHeader />
            <FileProcessingContainer>
                <UploadForm
                    onUpload={processFiles}
                    onRemoveFile={removeFile}
                    onManualSelect={handleManualSelect}
                    isProcessing={isProcessing}
                    fileResults={fileResults}
                />
            </FileProcessingContainer>
        </main>
    )
}
