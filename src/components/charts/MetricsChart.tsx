import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { ModelMetrics } from '@/lib/api';

interface MetricsChartProps {
  metrics: ModelMetrics[];
}

export function RMSEComparisonChart({ metrics }: MetricsChartProps) {
  const data = metrics.map(m => ({
    name: m.model_name.split(' ')[0],
    RMSE: m.rmse,
    MAE: m.mae,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <YAxis 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'Error (pK)', 
            angle: -90, 
            position: 'insideLeft',
            fill: 'hsl(var(--muted-foreground))'
          }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="RMSE" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="MAE" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PearsonComparisonChart({ metrics }: MetricsChartProps) {
  const data = metrics.map(m => ({
    name: m.model_name.split(' ')[0],
    'Pearson R': m.pearson_r,
    'R²': m.r_squared,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <YAxis 
          domain={[0, 1]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'Correlation', 
            angle: -90, 
            position: 'insideLeft',
            fill: 'hsl(var(--muted-foreground))'
          }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="Pearson R" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="R²" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ModelComparisonRadar({ metrics }: MetricsChartProps) {
  // Normalize metrics for radar chart
  const baseline = metrics.find(m => m.model_name.includes('Baseline'));
  const dl = metrics.find(m => m.model_name.includes('Deep Learning'));

  if (!baseline || !dl) return null;

  const data = [
    { metric: 'Pearson R', Baseline: baseline.pearson_r * 100, 'Deep Learning': dl.pearson_r * 100 },
    { metric: 'R²', Baseline: baseline.r_squared * 100, 'Deep Learning': dl.r_squared * 100 },
    { metric: 'Low RMSE', Baseline: (1 - baseline.rmse / 2) * 100, 'Deep Learning': (1 - dl.rmse / 2) * 100 },
    { metric: 'Low MAE', Baseline: (1 - baseline.mae / 2) * 100, 'Deep Learning': (1 - dl.mae / 2) * 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
        />
        <Radar
          name="Baseline"
          dataKey="Baseline"
          stroke="hsl(var(--chart-baseline))"
          fill="hsl(var(--chart-baseline))"
          fillOpacity={0.3}
        />
        <Radar
          name="Deep Learning"
          dataKey="Deep Learning"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
        />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Training progress simulation
export function TrainingProgressChart() {
  const epochs = Array.from({ length: 50 }, (_, i) => ({
    epoch: i + 1,
    'Training Loss': 2.5 * Math.exp(-i * 0.08) + 0.3 + Math.random() * 0.1,
    'Validation Loss': 2.5 * Math.exp(-i * 0.07) + 0.35 + Math.random() * 0.15,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={epochs} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="epoch" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'Epoch', 
            position: 'insideBottomRight', 
            offset: -5,
            fill: 'hsl(var(--muted-foreground))'
          }}
        />
        <YAxis 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'Loss', 
            angle: -90, 
            position: 'insideLeft',
            fill: 'hsl(var(--muted-foreground))'
          }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="Training Loss" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="Validation Loss" 
          stroke="hsl(var(--accent))" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
