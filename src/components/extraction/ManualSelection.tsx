import { Insured } from '@/types/insurance'
import InsuredSelector from '@/components/selector/InsuredSelector'

interface ManualSelectionProps {
    onSelect: (insured: Insured) => void
}

export default function ManualSelection({ onSelect }: ManualSelectionProps) {
    return (
        <>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">No Automatic Match Found</h4>
            <div className="space-y-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Please select the correct insured from the list below:
                </p>
                <InsuredSelector onSelect={onSelect} />
            </div>
        </>
    )
} 