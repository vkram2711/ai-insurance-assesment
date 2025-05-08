interface MatchScoreProps {
    score: number;
}

export default function MatchScore({ score }: MatchScoreProps) {
    // Convert score to percentage (assuming score is between 0 and 1)
    const percentage = Math.round(score * 100);
    
    // Determine color based on score
    const colorClass = score >= 0.8 
        ? 'bg-green-500 dark:bg-green-600' 
        : score >= 0.6 
            ? 'bg-yellow-500 dark:bg-yellow-600' 
            : 'bg-red-500 dark:bg-red-600';

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Match Score</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
} 