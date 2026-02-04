import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// Learning curve - performance vs training data size
function generateLearningCurveData() {
  const sizes = [1000, 5000, 10000, 25000, 50000, 75000, 90000];
  
  return sizes.map(size => {
    const baselineRMSE = 2.2 - 0.008 * Math.sqrt(size) + (Math.random() - 0.5) * 0.05;
    const dlRMSE = 2.0 - 0.010 * Math.sqrt(size) + (Math.random() - 0.5) * 0.03;
    
    return {
      samples: size,
      'Random Forest': Math.max(1.3, parseFloat(baselineRMSE.toFixed(2))),
      'GNN + Transformer': Math.max(0.95, parseFloat(dlRMSE.toFixed(2))),
    };
  });
}

export function LearningCurveChart() {
  const data = generateLearningCurveData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="samples" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          label={{ 
            value: 'Training Samples', 
            position: 'insideBottom', 
            offset: -10,
            fill: 'hsl(var(--muted-foreground))'
          }}
          tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
        />
        <YAxis 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'RMSE (pK)', 
            angle: -90, 
            position: 'insideLeft',
            fill: 'hsl(var(--muted-foreground))'
          }}
          domain={[0.8, 2.5]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [value.toFixed(2), '']}
          labelFormatter={(label) => `${label.toLocaleString()} samples`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="Random Forest" 
          stroke="hsl(var(--chart-baseline))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-baseline))', r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="GNN + Transformer" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
