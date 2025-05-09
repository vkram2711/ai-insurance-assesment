import { ReactNode } from 'react'

interface FileProcessingContainerProps {
    children: ReactNode
}

export default function FileProcessingContainer({ children }: FileProcessingContainerProps) {
    return (
        <div className="w-full max-w-4xl">
            {children}
        </div>
    )
} 