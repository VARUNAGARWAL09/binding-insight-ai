import { AtomImportance } from "@/lib/api";

interface AtomHeatmapProps {
  atomImportances: AtomImportance[];
  smiles: string;
}

const getAtomColor = (symbol: string) => {
  const colors: Record<string, string> = {
    'C': 'hsl(var(--atom-carbon))',
    'N': 'hsl(var(--atom-nitrogen))',
    'O': 'hsl(var(--atom-oxygen))',
    'S': 'hsl(var(--atom-sulfur))',
  };
  return colors[symbol] || 'hsl(var(--muted-foreground))';
};

const getImportanceColor = (importance: number) => {
  // Green gradient based on importance
  const hue = 142; // success green
  const saturation = 76;
  const lightness = 95 - (importance * 50); // Higher importance = darker
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export function AtomHeatmap({ atomImportances, smiles }: AtomHeatmapProps) {
  const maxImportance = Math.max(...atomImportances.map(a => a.importance));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Atom Importance (SHAP Values)</h4>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getAtomColor('C') }} />
            <span>Carbon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getAtomColor('N') }} />
            <span>Nitrogen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getAtomColor('O') }} />
            <span>Oxygen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getAtomColor('S') }} />
            <span>Sulfur</span>
          </div>
        </div>
      </div>

      {/* SMILES Display */}
      <div className="sequence-display text-xs">
        {smiles}
      </div>

      {/* Atom Grid */}
      <div className="flex flex-wrap gap-2">
        {atomImportances.map((atom, idx) => (
          <div
            key={idx}
            className="relative group"
          >
            <div
              className="w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-110 cursor-pointer border"
              style={{ 
                backgroundColor: getImportanceColor(atom.importance),
                borderColor: getAtomColor(atom.symbol)
              }}
            >
              <span 
                className="text-sm font-bold"
                style={{ color: getAtomColor(atom.symbol) }}
              >
                {atom.symbol}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {atom.atom_index}
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Importance: {(atom.importance * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* Importance Scale */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Low</span>
        <div className="flex-1 h-3 rounded-full overflow-hidden bg-gradient-to-r from-success/20 to-success" />
        <span className="text-xs text-muted-foreground">High</span>
      </div>

      {/* Key Atoms */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50">
        <h5 className="text-xs font-medium text-muted-foreground mb-2">Key Contributing Atoms</h5>
        <div className="flex flex-wrap gap-2">
          {atomImportances
            .filter(a => a.importance > 0.5)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 5)
            .map((atom, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-xs font-medium"
              >
                {atom.symbol}{atom.atom_index}
                <span className="text-success/70">({(atom.importance * 100).toFixed(0)}%)</span>
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
