import { useState, useEffect } from "react";
import { Clock, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPredictions } from "@/lib/historyStorage";
import { PredictionRecord } from "@/types/historyTypes";
import { toast } from "sonner";
import { StoredPrediction } from "@/lib/api";

interface PredictionHistoryProps {
  onSelect: (prediction: StoredPrediction) => void;
}

export function PredictionHistory({ onSelect }: PredictionHistoryProps) {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getPredictions();
      setPredictions(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      toast.error("Failed to load prediction history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAffinityColor = (pk: number) => {
    if (pk >= 9) return "text-green-500";
    if (pk >= 7) return "text-primary";
    if (pk >= 5) return "text-yellow-500";
    return "text-destructive";
  };

  const handleSelect = (record: PredictionRecord) => {
    // Convert PredictionRecord to StoredPrediction for compatibility
    const storedPrediction: StoredPrediction = {
      id: record.id,
      smiles: record.smiles,
      fasta: record.fasta,
      predicted_pk: record.predictedPk,
      confidence_score: record.confidenceScore,
      atom_importance: null, // History might not save full importance data yet
      residue_importance: null,
      drug_name: record.drugName,
      protein_name: record.proteinName,
      created_at: new Date(record.timestamp).toISOString()
    };
    onSelect(storedPrediction);
  };

  if (isLoading) {
    return (
      <div className="card-scientific p-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading prediction history...
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="card-scientific p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Prediction History</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No predictions yet. Run your first prediction to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="card-scientific p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Prediction History</h3>
          <Badge variant="secondary">{predictions.length} predictions</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchHistory}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {predictions.map((prediction) => (
            <button
              key={prediction.id}
              onClick={() => handleSelect(prediction)}
              className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${getAffinityColor(prediction.predictedPk)}`}>
                    {prediction.predictedPk.toFixed(2)} pK
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(prediction.confidenceScore * 100).toFixed(0)}% conf.)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(prediction.timestamp)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="truncate">
                  <span className="text-muted-foreground">Drug: </span>
                  <span className="font-mono">{prediction.drugName || prediction.smiles.slice(0, 20)}...</span>
                </div>
                <div className="truncate">
                  <span className="text-muted-foreground">Protein: </span>
                  <span className="font-mono">{prediction.proteinName || prediction.fasta.slice(0, 15)}...</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}