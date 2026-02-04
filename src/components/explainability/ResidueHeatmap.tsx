import { ResidueImportance } from "@/lib/api";

interface ResidueHeatmapProps {
  residueImportances: ResidueImportance[];
  fasta: string;
}

const getImportanceColor = (importance: number): string => {
  // Blue to red gradient based on importance
  if (importance < 0.3) {
    return `hsl(210, 40%, ${95 - importance * 30}%)`; // Light blue
  } else if (importance < 0.6) {
    return `hsl(38, 92%, ${75 - importance * 25}%)`; // Yellow-orange
  } else {
    return `hsl(0, ${60 + importance * 30}%, ${60 - importance * 15}%)`; // Red
  }
};

const AMINO_ACID_NAMES: Record<string, string> = {
  'A': 'Alanine', 'R': 'Arginine', 'N': 'Asparagine', 'D': 'Aspartic acid',
  'C': 'Cysteine', 'E': 'Glutamic acid', 'Q': 'Glutamine', 'G': 'Glycine',
  'H': 'Histidine', 'I': 'Isoleucine', 'L': 'Leucine', 'K': 'Lysine',
  'M': 'Methionine', 'F': 'Phenylalanine', 'P': 'Proline', 'S': 'Serine',
  'T': 'Threonine', 'W': 'Tryptophan', 'Y': 'Tyrosine', 'V': 'Valine'
};

export function ResidueHeatmap({ residueImportances, fasta }: ResidueHeatmapProps) {
  // Display first 50 residues with importance values
  const displayResidues = residueImportances.slice(0, 50);
  const hasMore = fasta.length > 50;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Residue Importance (Attention Weights)</h4>
        <span className="text-xs text-muted-foreground">
          Showing {displayResidues.length} of {fasta.length} residues
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {displayResidues.map((res, idx) => (
            <div
              key={idx}
              className="relative group"
            >
              <div
                className="w-6 h-8 flex items-center justify-center text-xs font-mono font-medium rounded-sm transition-transform hover:scale-125 hover:z-10 cursor-pointer"
                style={{ 
                  backgroundColor: getImportanceColor(res.importance),
                  color: res.importance > 0.5 ? 'white' : 'hsl(var(--foreground))'
                }}
              >
                {res.residue}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                <div className="font-medium">{AMINO_ACID_NAMES[res.residue] || res.residue}</div>
                <div>Position: {res.residue_index + 1}</div>
                <div>Importance: {(res.importance * 100).toFixed(1)}%</div>
              </div>
            </div>
          ))}
          {hasMore && (
            <div className="w-12 h-8 flex items-center justify-center text-xs text-muted-foreground">
              ...
            </div>
          )}
        </div>
      </div>

      {/* Position numbers */}
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {displayResidues.map((_, idx) => (
            <div
              key={idx}
              className="w-6 text-center text-[9px] text-muted-foreground"
            >
              {(idx + 1) % 5 === 0 ? idx + 1 : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Low</span>
        <div className="flex-1 h-3 rounded-full overflow-hidden">
          <div 
            className="w-full h-full"
            style={{
              background: 'linear-gradient(to right, hsl(210, 40%, 92%), hsl(38, 92%, 60%), hsl(0, 75%, 50%))'
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground">High</span>
      </div>

      {/* Binding Site Prediction */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50">
        <h5 className="text-xs font-medium text-muted-foreground mb-2">Predicted Binding Region</h5>
        <div className="flex flex-wrap gap-2">
          {residueImportances
            .filter(r => r.importance > 0.6)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 8)
            .map((res, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium"
              >
                {res.residue}{res.residue_index + 1}
                <span className="text-destructive/70">({(res.importance * 100).toFixed(0)}%)</span>
              </span>
            ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          These residues show high attention weights, indicating potential involvement in drug binding.
        </p>
      </div>
    </div>
  );
}
