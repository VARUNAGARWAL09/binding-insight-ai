import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, Loader2, AlertCircle, ExternalLink, History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppLayout } from "@/components/layout/AppLayout";
import { MoleculeInput } from "@/components/prediction/MoleculeInput";
import { ProteinInput } from "@/components/prediction/ProteinInput";
import { PredictionResult } from "@/components/prediction/PredictionResult";
import { PredictionHistory } from "@/components/prediction/PredictionHistory";
import { MoleculeGenerator } from "@/components/prediction/MoleculeGenerator";
import {
  predictBinding,
  PredictionResponse,
  EXTERNAL_RESOURCES
} from "@/lib/api";
import { addPrediction } from "@/lib/historyStorage";
import { toast } from "sonner";

export default function Prediction() {
  const navigate = useNavigate();
  const [smiles, setSmiles] = useState("");
  const [fasta, setFasta] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handlePredict = async () => {
    if (!smiles.trim() || !fasta.trim()) {
      setError("Please provide both SMILES and FASTA sequences.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictBinding({ smiles, fasta });
      setResult(response);

      // Save to history with better naming
      const drugName = smiles.length > 20 ? `${smiles.substring(0, 20)}...` : smiles;
      const proteinName = fasta.length > 30 ? `${fasta.substring(0, 30)}...` : fasta;

      await addPrediction({
        source: 'single',
        drugName: drugName,
        smiles,
        proteinName: proteinName,
        fasta,
        predictedPk: response.binding_affinity_pk,
        confidenceScore: response.confidence_score * 100, // Convert to percentage
        isFavorite: false,
        notes: '',
        tags: []
      });

      toast.success("Prediction completed successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prediction failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewExplainability = () => {
    // Store prediction data for explainability page
    sessionStorage.setItem('lastPrediction', JSON.stringify({
      smiles,
      fasta,
      result,
    }));
    navigate('/explainability');
  };

  const handleSelectFromHistory = (prediction: any) => {
    setSmiles(prediction.smiles);
    setFasta(prediction.fasta);
    setResult({
      prediction_id: prediction.id,
      binding_affinity_pk: prediction.predicted_pk,
      confidence_score: prediction.confidence_score / 100, // Normalize to 0-1 range to match API format
      atom_importances: prediction.atom_importance,
      residue_importances: prediction.residue_importance,
    });
    setShowHistory(false);
    toast.success("Loaded prediction from history");
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Binding Prediction</h1>
              </div>
              <p className="text-muted-foreground">
                Enter drug SMILES and protein FASTA sequences to predict binding affinity using AI.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              {showHistory ? "Hide History" : "View History"}
            </Button>
          </div>
        </div>

        {/* Prediction History */}
        {showHistory && (
          <div className="mb-6">
            <PredictionHistory onSelect={handleSelectFromHistory} />
          </div>
        )}

        {/* AI Molecule Generator */}
        <div className="mb-6">
          <MoleculeGenerator
            onDrugGenerated={setSmiles}
            onProteinGenerated={setFasta}
          />
        </div>

        {/* External Resources */}
        <div className="card-scientific p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            Get SMILES & FASTA from External Databases
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Drug SMILES Sources:</p>
              <div className="flex flex-wrap gap-2">
                {EXTERNAL_RESOURCES.smiles.map(resource => (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title={resource.description}
                  >
                    {resource.name} ↗
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Protein FASTA Sources:</p>
              <div className="flex flex-wrap gap-2">
                {EXTERNAL_RESOURCES.fasta.map(resource => (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors"
                    title={resource.description}
                  >
                    {resource.name} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="card-scientific p-6 mb-6 space-y-6">
          <MoleculeInput
            value={smiles}
            onChange={setSmiles}
            disabled={isLoading}
          />

          <div className="border-t border-border" />

          <ProteinInput
            value={fasta}
            onChange={setFasta}
            disabled={isLoading}
          />

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Predict Button */}
          <Button
            onClick={handlePredict}
            disabled={isLoading || !smiles.trim() || !fasta.trim()}
            variant="scientific"
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <FlaskConical className="h-4 w-4 mr-2" />
                Predict Binding Affinity
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {result && (
          <PredictionResult
            result={result}
            smiles={smiles}
            fasta={fasta}
            onViewExplainability={handleViewExplainability}
          />
        )}
      </div>
    </AppLayout>
  );
}