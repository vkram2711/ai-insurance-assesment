import { Insured } from '@/types/insurance'

interface InsuredItemProps {
    insured: Insured
    onClick: () => void
}

export default function InsuredItem({ insured, onClick }: InsuredItemProps) {
    return (
        <button
            onClick={onClick}
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
    )
} 