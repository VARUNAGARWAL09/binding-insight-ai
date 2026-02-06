import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  LabelList
} from 'recharts';

interface PredictionScatterChartProps {
  modelType: 'baseline' | 'dl';
}

// Generate synthetic prediction vs actual data
function generatePredictionData(modelType: 'baseline' | 'dl') {
  const data = [];
  const noise = modelType === 'baseline' ? 1.4 : 0.9;

  for (let i = 0; i < 200; i++) {
    const actual = 3 + Math.random() * 8; // pK range 3-11
    const predicted = actual + (Math.random() - 0.5) * noise * 2;
    data.push({
      actual: parseFloat(actual.toFixed(2)),
      predicted: parseFloat(Math.max(3, Math.min(11, predicted)).toFixed(2)),
    });
  }
  return data;
}

export function PredictionScatterChart({ modelType }: PredictionScatterChartProps) {
  const data = generatePredictionData(modelType);
  const color = modelType === 'baseline' ? 'hsl(var(--chart-baseline))' : 'hsl(var(--primary))';
  const label = modelType === 'baseline' ? 'Random Forest' : 'GNN + Transformer';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="actual"
          type="number"
          domain={[3, 11]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{
            value: 'Actual pK',
            position: 'insideBottom',
            offset: -10,
            fill: 'hsl(var(--muted-foreground))'
          }}
        />
        <YAxis
          dataKey="predicted"
          type="number"
          domain={[3, 11]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          label={{
            value: 'Predicted pK',
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
          formatter={(value: number) => [value.toFixed(2), '']}
          labelFormatter={() => ''}
        />
        <ReferenceLine
          segment={[{ x: 3, y: 3 }, { x: 11, y: 11 }]}
          stroke="hsl(var(--success))"
          strokeDasharray="5 5"
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{ paddingTop: '10px' }}
          iconType="circle"
        />
        <Scatter
          name={label}
          data={data}
          fill={color}
          fillOpacity={0.6}
        >
          <LabelList
            dataKey="predicted"
            position="top"
            style={{
              fontSize: '8px',
              fill: 'hsl(var(--muted-foreground))',
              fontWeight: 500
            }}
            formatter={(value: number) => value.toFixed(1)}
          />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
