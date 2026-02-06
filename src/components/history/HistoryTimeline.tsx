import { PredictionRecord } from '@/types/historyTypes';
import { PredictionCard } from './PredictionCard';
import { format, isToday, isYesterday, isThisWeek, startOfWeek } from 'date-fns';

interface HistoryTimelineProps {
    predictions: PredictionRecord[];
    onToggleFavorite: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    onAddNote: (id: string) => void;
}

export function HistoryTimeline({
    predictions,
    onToggleFavorite,
    onDelete,
    onView,
    onAddNote
}: HistoryTimelineProps) {
    // Group predictions by date
    const groupedPredictions = predictions.reduce((groups, prediction) => {
        const date = new Date(prediction.timestamp);
        let groupKey: string;

        if (isToday(date)) {
            groupKey = 'Today';
        } else if (isYesterday(date)) {
            groupKey = 'Yesterday';
        } else if (isThisWeek(date, { weekStartsOn: 1 })) {
            groupKey = 'This Week';
        } else {
            groupKey = format(date, 'MMMM yyyy');
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(prediction);
        return groups;
    }, {} as Record<string, PredictionRecord[]>);

    const groupOrder = ['Today', 'Yesterday', 'This Week'];
    const sortedGroups = Object.keys(groupedPredictions).sort((a, b) => {
        const aIndex = groupOrder.indexOf(a);
        const bIndex = groupOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return b.localeCompare(a);
    });

    if (predictions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No predictions found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Start by making a prediction or adjust your filters
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {sortedGroups.map(group => (
                <div key={group}>
                    <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background py-2 z-10">
                        {group}
                    </h3>
                    <div className="space-y-3">
                        {groupedPredictions[group].map(prediction => (
                            <PredictionCard
                                key={prediction.id}
                                prediction={prediction}
                                onToggleFavorite={onToggleFavorite}
                                onDelete={onDelete}
                                onView={onView}
                                onAddNote={onAddNote}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
