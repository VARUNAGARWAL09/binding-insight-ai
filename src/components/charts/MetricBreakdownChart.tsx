import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface MetricBreakdownChartProps {
  type: 'affinity' | 'protein';
}

// Performance breakdown by affinity range or protein category
export function MetricBreakdownChart({ type }: MetricBreakdownChartProps) {
  const affinityData = [
    { category: 'Low (pK < 5)', baseline: 1.65, dl: 1.28, label: 'Weak binders' },
    { category: 'Medium (5-7)', baseline: 1.38, dl: 0.98, label: 'Moderate binders' },
    { category: 'High (7-9)', baseline: 1.32, dl: 0.92, label: 'Strong binders' },
    { category: 'Very High (> 9)', baseline: 1.55, dl: 1.15, label: 'Very strong binders' },
  ];

  const proteinData = [
    { category: 'Kinases', baseline: 1.45, dl: 1.02, label: 'Enzyme class' },
    { category: 'GPCRs', baseline: 1.52, dl: 1.12, label: 'Membrane proteins' },
    { category: 'Proteases', baseline: 1.38, dl: 0.95, label: 'Enzyme class' },
    { category: 'Nuclear Receptors', baseline: 1.48, dl: 1.08, label: 'Transcription factors' },
  ];

  const data = type === 'affinity' ? affinityData : proteinData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          type="number"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'RMSE (pK units)', 
            position: 'insideBottom', 
            offset: -5,
            fill: 'hsl(var(--muted-foreground))'
          }}
          domain={[0, 2]}
        />
        <YAxis 
          dataKey="category"
          type="category"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          width={120}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number, name: string) => [value.toFixed(2), name]}
        />
        <Legend />
        <Bar 
          dataKey="baseline" 
          name="Random Forest"
          fill="hsl(var(--chart-baseline))" 
          radius={[0, 4, 4, 0]}
        />
        <Bar 
          dataKey="dl" 
          name="GNN + Transformer"
          fill="hsl(var(--primary))" 
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
