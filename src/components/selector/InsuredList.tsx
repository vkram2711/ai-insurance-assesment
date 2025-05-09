import { Insured } from '@/types/insurance'
import InsuredItem from './InsuredItem'

interface InsuredListProps {
    insureds: Insured[]
    onSelect: (insured: Insured) => void
}

export default function InsuredList({ insureds, onSelect }: InsuredListProps) {
    return (
        <div className="space-y-3">
            {insureds.map(insured => (
                <InsuredItem
                    key={insured.internalId}
                    insured={insured}
                    onClick={() => onSelect(insured)}
                />
            ))}
        </div>
    )
} 