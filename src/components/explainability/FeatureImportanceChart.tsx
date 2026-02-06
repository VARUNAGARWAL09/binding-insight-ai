import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FeatureData {
    label: string;
    value: number;
    index: number;
}

interface FeatureImportanceChartProps {
    data: FeatureData[];
    title: string;
    color: string;
}

export function FeatureImportanceChart({ data, title, color }: FeatureImportanceChartProps) {
    // Sort data descending to show most important first
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 10);

    return (
        <div className="w-full h-[300px]">
            <h3 className="text-sm font-semibold mb-4 text-center text-muted-foreground">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.1} />
                    <XAxis type="number" domain={[0, 1]} hide />
                    <YAxis
                        type="category"
                        dataKey="label"
                        width={40}
                        tick={{ fontSize: 12, fill: 'currentColor' }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--foreground))',
                            borderRadius: '6px'
                        }}
                        formatter={(value: number) => [value.toFixed(3), 'Importance']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8 - (index * 0.05)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
