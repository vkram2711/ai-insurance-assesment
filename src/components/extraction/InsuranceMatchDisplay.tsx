import { InsuranceMatch } from '@/types/insurance'
import MatchScore from '@/components/MatchScore'

interface InsuranceMatchDisplayProps {
    match: InsuranceMatch
}

export default function InsuranceMatchDisplay({ match }: InsuranceMatchDisplayProps) {
    return (
        <>
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">
                {match.isManual ? 'Manually Selected Insured' : 'Insurance Match Found'}
            </h4>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            {match.insured.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500">
                            ID: {match.insured.internalId}
                        </p>
                    </div>
                    {!match.isManual && <MatchScore score={match.score} />}
                </div>
            </div>
        </>
    )
} 