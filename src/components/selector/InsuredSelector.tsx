import { useState, useMemo } from 'react'
import { Insured } from '@/types/insurance'
import { INSUREDS } from '@/lib/match'
import SearchBar from './SearchBar'
import InsuredList from './InsuredList'
import Pagination from './Pagination'
import NoResults from './NoResults'

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
            <SearchBar value={searchTerm} onChange={handleSearch} />
            
            {filteredInsureds.length > 0 ? (
                <>
                    <InsuredList insureds={paginatedInsureds} onSelect={onSelect} />
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            ) : (
                <NoResults />
            )}
        </div>
    )
} 