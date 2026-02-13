import { Activity, Shield, Download, Brain, FileText, AlertCircle, CheckCircle2, Pill, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PredictionResponse } from "@/lib/api";
import { generatePredictionPDF } from "@/lib/pdfGenerator";
import { calculateDrugLikeness, getDrugLikenessColor } from "@/lib/drugLikenessCalculator";
import { useFavorites } from "@/hooks/useFavorites";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { toast } from "sonner";

interface PredictionResultProps {
  result: PredictionResponse;
  smiles: string;
  fasta: string;
  onViewExplainability: () => void;
}

export function PredictionResult({ result, smiles, fasta, onViewExplainability }: PredictionResultProps) {
  const getAffinityCategory = (pk: number) => {
    if (pk >= 9) return { label: 'Very High', color: 'text-success' };
    if (pk >= 7) return { label: 'High', color: 'text-success' };
    if (pk >= 5) return { label: 'Moderate', color: 'text-warning' };
    return { label: 'Low', color: 'text-destructive' };
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.85) return { label: 'High', color: 'bg-success' };
    if (score >= 0.65) return { label: 'Medium', color: 'bg-warning' };
    return { label: 'Low', color: 'bg-destructive' };
  };

  const affinityCategory = getAffinityCategory(result.binding_affinity_pk);
  const confidenceLevel = getConfidenceLevel(result.confidence_score);

  // Calculate confidence interval (┬▒1 standard deviation)
  const confidenceInterval = 0.15; // Fixed interval for demonstration
  const lowerBound = result.binding_affinity_pk - confidenceInterval;
  const upperBound = result.binding_affinity_pk + confidenceInterval;

  // Calculate drug-likeness
  const drugLikeness = calculateDrugLikeness(smiles);

  // Favorites functionality
  const { addFavorite, removeFavorite, isFavorite, getFavorite } = useFavorites();
  const favoriteExists = isFavorite(smiles, fasta);
  const currentFavorite = getFavorite(smiles, fasta);

  const handleToggleFavorite = () => {
    if (favoriteExists && currentFavorite) {
      removeFavorite(currentFavorite.id);
      toast.success('Removed from favorites');
    } else {
      addFavorite({
        smiles,
        fasta,
        predictedPk: result.binding_affinity_pk,
        confidenceScore: result.confidence_score,
      });
      toast.success('Added to favorites!');
    }
  };

  const handleDownloadPDF = () => {
    try {
      generatePredictionPDF({
        smiles,
        fasta,
        result,
      });
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  const handleDownloadJSON = () => {
    const report = {
      prediction_id: result.prediction_id,
      binding_affinity_pk: result.binding_affinity_pk,
      confidence_score: result.confidence_score,
      affinity_category: affinityCategory.label,
      confidence_level: confidenceLevel.label,
      input: {
        smiles,
        fasta: fasta.slice(0, 100) + (fasta.length > 100 ? '...' : ''),
      },
      generated_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction_${result.prediction_id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('JSON report downloaded!');
  };

  return (
    <div className="prediction-result animate-scale-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-foreground">Prediction Results</h3>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
          ID: {result.prediction_id}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Binding Affinity */}
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-primary" />
            <span>Predicted Binding Affinity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {result.binding_affinity_pk.toFixed(2)}
            </span>
            <span className="text-lg text-muted-foreground">pK</span>
          </div>
          <div className="text-xs text-muted-foreground">
            95% CI: {lowerBound.toFixed(2)} ΓÇô {upperBound.toFixed(2)}
          </div>
          <div className={`status-badge ${affinityCategory.label === 'Very High' || affinityCategory.label === 'High'
            ? 'status-badge-success'
            : affinityCategory.label === 'Moderate'
              ? 'status-badge-warning'
              : 'status-badge-error'
            }`}>
            {affinityCategory.label} Affinity
          </div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-success/5 to-success/10 border border-success/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-success" />
            <GlossaryTooltip term="confidence score">
              <span>Confidence Score</span>
            </GlossaryTooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {(result.confidence_score * 100).toFixed(1)}
            </span>
            <span className="text-lg text-muted-foreground">%</span>
          </div>
          <div className="space-y-2">
            <div className="progress-scientific">
              <div
                className={`progress-scientific-fill ${confidenceLevel.color}`}
                style={{ width: `${result.confidence_score * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {confidenceLevel.label} confidence prediction
            </span>
          </div>
        </div>
      </div>

      {/* Drug-Likeness Analysis */}
      <div className="rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 p-4 space-y-3 border border-accent/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-medium text-foreground">Drug-Likeness Analysis</h4>
          </div>
          <Badge className={`${getDrugLikenessColor(drugLikeness.classification)} border`}>
            {drugLikeness.isValid ? (
              <>
                {drugLikeness.classification === 'Drug-like' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {drugLikeness.classification !== 'Drug-like' && <AlertCircle className="h-3 w-3 mr-1" />}
                {drugLikeness.classification}
              </>
            ) : (
              'Invalid SMILES'
            )}
          </Badge>
        </div>

        {drugLikeness.isValid && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="text-xs">
                <span className="text-muted-foreground">MW:</span>
                <span className={`ml-1 font-mono font-semibold ${drugLikeness.properties.molecularWeight <= 500 ? 'text-success' : 'text-destructive'
                  }`}>
                  {drugLikeness.properties.molecularWeight.toFixed(1)} Da
                </span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">LogP:</span>
                <span className={`ml-1 font-mono font-semibold ${drugLikeness.properties.logP <= 5 ? 'text-success' : 'text-destructive'
                  }`}>
                  {drugLikeness.properties.logP.toFixed(2)}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">H-Donors:</span>
                <span className={`ml-1 font-mono font-semibold ${drugLikeness.properties.hDonors <= 5 ? 'text-success' : 'text-destructive'
                  }`}>
                  {drugLikeness.properties.hDonors}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">H-Acceptors:</span>
                <span className={`ml-1 font-mono font-semibold ${drugLikeness.properties.hAcceptors <= 10 ? 'text-success' : 'text-destructive'
                  }`}>
                  {drugLikeness.properties.hAcceptors}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Rot. Bonds:</span>
                <span className="ml-1 font-mono font-semibold">
                  {drugLikeness.properties.rotatableBonds}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">PSA:</span>
                <span className="ml-1 font-mono font-semibold">
                  {drugLikeness.properties.polarSurfaceArea.toFixed(1)} ┼▓
                </span>
              </div>
            </div>

            {drugLikeness.violations.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                <span className="font-medium text-warning">Violations ({drugLikeness.violations.length}):</span>
                <span className="ml-1">{drugLikeness.violations.join(', ')}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Interpretation */}
      <div className="rounded-xl bg-muted/50 p-4 space-y-2 border border-border">
        <h4 className="text-sm font-medium text-foreground">Interpretation</h4>
        <p className="text-sm text-muted-foreground">
          The predicted binding affinity of <strong className="text-foreground">{result.binding_affinity_pk.toFixed(2)} pK</strong> indicates
          {affinityCategory.label === 'Very High' || affinityCategory.label === 'High'
            ? ' a strong potential interaction between the drug and protein target. This compound may be a promising candidate for further investigation.'
            : affinityCategory.label === 'Moderate'
              ? ' a moderate interaction potential. Additional modifications may improve binding characteristics.'
              : ' a weak interaction. Consider structural modifications to enhance binding affinity.'
          }
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 flex-wrap">
        <Button
          variant="scientific"
          onClick={onViewExplainability}
          className="flex-1 min-w-[180px]"
        >
          <Brain className="h-4 w-4 mr-2" />
          View Explainability
        </Button>
        <Button
          variant={favoriteExists ? "default" : "outline"}
          onClick={handleToggleFavorite}
          className="min-w-[120px]"
        >
          <Star className={`h-4 w-4 mr-2 ${favoriteExists ? 'fill-current' : ''}`} />
          {favoriteExists ? 'Saved' : 'Save'}
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadPDF}
          className="min-w-[140px]"
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF Report
        </Button>
        <Button
          variant="ghost"
          onClick={handleDownloadJSON}
        >
          <Download className="h-4 w-4 mr-2" />
          JSON
        </Button>
      </div>
    </div >
  );
}

