import { useState, useMemo } from 'react'
import { Insured } from '@/types/insurance'
import { INSUREDS } from '@/lib/match'

interface InsuredSelectorProps {
    onSelect: (insured: Insured) => void
}

const ITEMS_PER_PAGE = 5

export default function InsuredSelector({ onSelect }: InsuredSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const filteredInsureds = useMemo(() => {
        return INSUREDS.filter(insured => 
            insured.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            insured.internalId.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [searchTerm])

    const totalPages = Math.ceil(filteredInsureds.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedInsureds = filteredInsureds.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Reset to first page on new search
    }

    return (
        <div className="space-y-6">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full px-4 py-2.5 pl-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 outline-none transition-shadow duration-200"
                />
                <svg 
                    className="absolute left-4 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                </svg>
            </div>

            <div className="space-y-3">
                {paginatedInsureds.map(insured => (
                    <button
                        key={insured.internalId}
                        onClick={() => onSelect(insured)}
                        className="w-full px-4 py-3.5 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    >
                        <div className="flex justify-between items-center">
                            <div className="space-y-0.5">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {insured.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {insured.internalId}
                                </p>
                            </div>
                            <svg 
                                className="h-5 w-5 text-gray-400 dark:text-gray-500" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 5l7 7-7 7" 
                                />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 rounded-md"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 rounded-md"
                    >
                        Next
                    </button>
                </div>
            )}

            {filteredInsureds.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    No insureds found matching your search
                </div>
            )}
        </div>
    )
} 