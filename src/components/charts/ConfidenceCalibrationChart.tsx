import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

// Calibration curve data - how well confidence matches actual accuracy
function generateCalibrationData() {
  const buckets = [
    { confidence: 0.1, ideal: 0.1, baseline: 0.05, dl: 0.08 },
    { confidence: 0.2, ideal: 0.2, baseline: 0.12, dl: 0.18 },
    { confidence: 0.3, ideal: 0.3, baseline: 0.18, dl: 0.27 },
    { confidence: 0.4, ideal: 0.4, baseline: 0.25, dl: 0.38 },
    { confidence: 0.5, ideal: 0.5, baseline: 0.32, dl: 0.48 },
    { confidence: 0.6, ideal: 0.6, baseline: 0.42, dl: 0.58 },
    { confidence: 0.7, ideal: 0.7, baseline: 0.50, dl: 0.68 },
    { confidence: 0.8, ideal: 0.8, baseline: 0.58, dl: 0.77 },
    { confidence: 0.9, ideal: 0.9, baseline: 0.65, dl: 0.86 },
    { confidence: 1.0, ideal: 1.0, baseline: 0.72, dl: 0.94 },
  ];
  return buckets;
}

export function ConfidenceCalibrationChart() {
  const data = generateCalibrationData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="confidence" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'Predicted Confidence', 
            position: 'insideBottom', 
            offset: -10,
            fill: 'hsl(var(--muted-foreground))'
          }}
          domain={[0, 1]}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <YAxis 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'Actual Accuracy', 
            angle: -90, 
            position: 'insideLeft',
            fill: 'hsl(var(--muted-foreground))'
          }}
          domain={[0, 1]}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '']}
          labelFormatter={(label) => `Confidence: ${(label * 100).toFixed(0)}%`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="ideal" 
          name="Perfect Calibration"
          stroke="hsl(var(--success))" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="baseline" 
          name="Random Forest"
          stroke="hsl(var(--chart-baseline))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-baseline))', r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="dl" 
          name="GNN + Transformer"
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
