import { Card } from '@/components/ui/card';
import { Activity, TrendingUp, Target, Beaker } from 'lucide-react';
import { HistoryStats } from '@/types/historyTypes';

interface HistorySummaryCardsProps {
    stats: HistoryStats | null;
    loading?: boolean;
}

export function HistorySummaryCards({ stats, loading }: HistorySummaryCardsProps) {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-16 bg-muted rounded" />
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Predictions',
            value: stats.totalPredictions.toLocaleString(),
            icon: Activity,
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            title: 'Average pK',
            value: stats.averagePk.toFixed(2),
            icon: TrendingUp,
            color: 'text-success',
            bgColor: 'bg-success/10'
        },
        {
            title: 'Avg Confidence',
            value: `${stats.averageConfidence.toFixed(1)}%`,
            icon: Target,
            color: 'text-accent',
            bgColor: 'bg-accent/10'
        },
        {
            title: 'Top Protein',
            value: stats.mostTestedProtein,
            icon: Beaker,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
            truncate: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                            <p className={`text-2xl font-bold ${card.truncate ? 'truncate' : ''}`}>
                                {card.value}
                            </p>
                        </div>
                        <div className={`${card.bgColor} p-3 rounded-lg`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
