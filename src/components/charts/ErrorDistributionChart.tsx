import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ErrorDistributionChartProps {
  modelType: 'baseline' | 'dl';
}

// Generate error distribution data
function generateErrorDistribution(modelType: 'baseline' | 'dl') {
  const stdDev = modelType === 'baseline' ? 1.42 : 1.07;
  const bins = [
    { range: '< 0.5', baseline: 0, dl: 0 },
    { range: '0.5-1.0', baseline: 0, dl: 0 },
    { range: '1.0-1.5', baseline: 0, dl: 0 },
    { range: '1.5-2.0', baseline: 0, dl: 0 },
    { range: '2.0-2.5', baseline: 0, dl: 0 },
    { range: '> 2.5', baseline: 0, dl: 0 },
  ];
  
  // Simulate 1000 predictions
  for (let i = 0; i < 1000; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const error = Math.abs(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * stdDev);
    
    if (error < 0.5) bins[0][modelType === 'baseline' ? 'baseline' : 'dl']++;
    else if (error < 1.0) bins[1][modelType === 'baseline' ? 'baseline' : 'dl']++;
    else if (error < 1.5) bins[2][modelType === 'baseline' ? 'baseline' : 'dl']++;
    else if (error < 2.0) bins[3][modelType === 'baseline' ? 'baseline' : 'dl']++;
    else if (error < 2.5) bins[4][modelType === 'baseline' ? 'baseline' : 'dl']++;
    else bins[5][modelType === 'baseline' ? 'baseline' : 'dl']++;
  }
  
  return bins;
}

export function ErrorDistributionChart() {
  // Combine both distributions
  const baselineData = generateErrorDistribution('baseline');
  const dlData = generateErrorDistribution('dl');
  
  const combinedData = baselineData.map((item, i) => ({
    range: item.range,
    'Random Forest': item.baseline,
    'GNN + Transformer': dlData[i].dl,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="range" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          label={{ 
            value: 'Absolute Error (pK units)', 
            position: 'insideBottom', 
            offset: -10,
            fill: 'hsl(var(--muted-foreground))'
          }}
        />
        <YAxis 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{ 
            value: 'Frequency', 
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
        <Bar 
          dataKey="Random Forest" 
          fill="hsl(var(--chart-baseline))" 
          radius={[4, 4, 0, 0]}
          fillOpacity={0.8}
        />
        <Bar 
          dataKey="GNN + Transformer" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]}
          fillOpacity={0.8}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
