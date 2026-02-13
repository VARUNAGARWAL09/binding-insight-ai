import { Card } from '@/components/ui/card';
import { HistoryStats } from '@/types/historyTypes';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface HistoryTrendChartsProps {
    stats: HistoryStats | null;
}

export function HistoryTrendCharts({ stats }: HistoryTrendChartsProps) {
    if (!stats) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-64 bg-muted rounded" />
                    </Card>
                ))}
            </div>
        );
    }

    // Format data for charts
    const dailyData = stats.predictionsByDay.map(item => ({
        date: format(new Date(item.date), 'MMM dd'),
        count: item.count
    }));

    return (
        <div className="space-y-6">
            {/* Predictions Per Day */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Predictions Over Time (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            name="Predictions"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Source Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Prediction Source</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Single Predictions</span>
                                <span className="font-semibold">{stats.predictionsBySource.single}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{
                                        width: `${(stats.predictionsBySource.single / stats.totalPredictions) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Batch Predictions</span>
                                <span className="font-semibold">{stats.predictionsBySource.batch}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full transition-all"
                                    style={{
                                        width: `${(stats.predictionsBySource.batch / stats.totalPredictions) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Average pK</span>
                            <span className="text-2xl font-bold text-success">{stats.averagePk.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Average Confidence</span>
                            {stats.averageConfidence.toFixed(1)}%
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Predictions</span>
                            <span className="text-2xl font-bold text-primary">{stats.totalPredictions}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
