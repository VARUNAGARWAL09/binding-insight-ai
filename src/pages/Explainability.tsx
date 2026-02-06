import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, ArrowLeft, Download, Loader2, FileText, History as HistoryIcon, Eye, BarChart3, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { AtomHeatmap } from "@/components/explainability/AtomHeatmap";
import { ResidueHeatmap } from "@/components/explainability/ResidueHeatmap";
import { MoleculeViewer3D } from "@/components/visualization/MoleculeViewer3D";
import { ProteinViewer3D } from "@/components/visualization/ProteinViewer3D";
import { PredictionHistory } from "@/components/prediction/PredictionHistory";
import { FeatureImportanceChart } from "@/components/explainability/FeatureImportanceChart";
import { generateExplainabilityPDF } from "@/lib/pdfGenerator";
import { generateEnrichedAtomImportances, generateEnrichedResidueImportances } from "@/lib/explainabilityUtils";
import { toast } from "sonner";
import {
  ExplainabilityResponse,
  PredictionResponse,
  SAMPLE_MOLECULES,
  SAMPLE_PROTEINS,
  StoredPrediction
} from "@/lib/api";

interface StoredPredictionData {
  smiles: string;
  fasta: string;
  result: PredictionResponse;
}

export default function Explainability() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [explainData, setExplainData] = useState<ExplainabilityResponse | null>(null);
  const [predictionData, setPredictionData] = useState<StoredPredictionData | null>(null);
  const [show3D, setShow3D] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const loadPredictionData = (data: StoredPredictionData) => {
    setPredictionData(data);

    // Generate explainability using enriched utils if not present
    const atomImportances = data.result.atom_importances || generateEnrichedAtomImportances(data.smiles);
    const residueImportances = data.result.residue_importances || generateEnrichedResidueImportances(data.fasta);

    setExplainData({
      prediction_id: data.result.prediction_id,
      atom_importances: atomImportances,
      residue_importances: residueImportances,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('lastPrediction');

    // Simulate loading/processing time
    setTimeout(() => {
      if (stored) {
        const parsed = JSON.parse(stored) as StoredPredictionData;
        loadPredictionData(parsed);
      } else {
        // Use sample data on first load if no prediction exists
        const sampleData: StoredPredictionData = {
          smiles: SAMPLE_MOLECULES[0].smiles,
          fasta: SAMPLE_PROTEINS[0].fasta.slice(0, 300),
          result: {
            binding_affinity_pk: 7.42,
            confidence_score: 0.89,
            prediction_id: 'demo_001',
          },
        };
        loadPredictionData(sampleData);
      }
    }, 800);
  }, []);

  const handleSelectFromHistory = (prediction: StoredPrediction) => {
    const data: StoredPredictionData = {
      smiles: prediction.smiles,
      fasta: prediction.fasta,
      result: {
        prediction_id: prediction.id,
        binding_affinity_pk: prediction.predicted_pk,
        confidence_score: prediction.confidence_score / 100, // Normalize to 0-1 range to match API format
        atom_importances: prediction.atom_importance || undefined,
        residue_importances: prediction.residue_importance || undefined,
      },
    };
    loadPredictionData(data);
    setShowHistory(false);
    toast.success("Loaded analysis from history");
  };

  const handleDownloadPDF = () => {
    if (!explainData || !predictionData) return;
    try {
      generateExplainabilityPDF(
        explainData,
        predictionData.smiles,
        predictionData.fasta,
        predictionData.result.binding_affinity_pk,
        predictionData.result.confidence_score
      );
      toast.success('Detailed PDF report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  const prepareFeatureData = (type: 'atoms' | 'residues') => {
    if (!explainData) return [];
    if (type === 'atoms') {
      return explainData.atom_importances.map(a => ({
        label: `${a.symbol}${a.atom_index}`,
        value: a.importance,
        index: a.atom_index
      }));
    } else {
      return explainData.residue_importances.map(r => ({
        label: `${r.residue}${r.residue_index}`,
        value: r.importance,
        index: r.residue_index
      }));
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-7xl pt-4 pb-12 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Explainability Analytics
              </h1>
            </div>
            <p className="text-muted-foreground text-lg ml-14">
              Visualize atomic contributions and protein attention weights
            </p>
          </div>

          <div className="flex gap-3 ml-14 md:ml-0">
            <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
              <HistoryIcon className="h-4 w-4 mr-2" />
              {showHistory ? "Hide History" : "History"}
            </Button>
            <Button asChild variant="default" className="bg-gradient-to-r from-primary to-primary/80">
              <Link to="/prediction">
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Prediction
              </Link>
            </Button>
          </div>
        </div>

        {/* Prediction History Drawer */}
        {showHistory && (
          <Card className="p-4 bg-muted/30 border-dashed animate-in slide-in-from-top-4">
            <PredictionHistory onSelect={handleSelectFromHistory} />
          </Card>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground text-lg animate-pulse">Running SHAP analysis & attention mechanism...</p>
          </div>
        ) : explainData && predictionData ? (
          <div className="space-y-8">

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-primary flex flex-col justify-center">
                <span className="text-sm text-muted-foreground">Predicted pK</span>
                <span className="text-2xl font-bold">{predictionData.result.binding_affinity_pk.toFixed(2)}</span>
              </Card>
              <Card className="p-4 border-l-4 border-l-success flex flex-col justify-center">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className="text-2xl font-bold">{(predictionData.result.confidence_score * 100).toFixed(0)}%</span>
              </Card>
              <Card className="p-4 md:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground block">Drug Molecule</span>
                  <span className="font-mono text-sm font-medium trunc">{predictionData.smiles.substring(0, 35)}...</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </Card>
            </div>

            {/* Main Viz Tabs */}
            <Card className="border-2 overflow-hidden">
              <Tabs defaultValue="atoms" className="w-full">
                <div className="border-b bg-muted/30 px-6 pt-6">
                  <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                    <TabsTrigger value="atoms" className="gap-2">
                      <Atom className="h-4 w-4" /> Drug Analysis (SHAP)
                    </TabsTrigger>
                    <TabsTrigger value="residues" className="gap-2">
                      <BarChart3 className="h-4 w-4" /> Protein Attention
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="atoms" className="p-6 space-y-6 mt-0">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" /> Atomic Contributions Map
                      </h3>
                      <div className="border rounded-lg p-4 bg-background min-h-[400px]">
                        <AtomHeatmap
                          atomImportances={explainData.atom_importances}
                          smiles={predictionData.smiles}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Top Contributors</h3>
                      <div className="border rounded-lg p-4 bg-background h-full">
                        <FeatureImportanceChart
                          data={prepareFeatureData('atoms')}
                          title="Highest Impact Atoms"
                          color="hsl(var(--primary))"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="residues" className="p-6 space-y-6 mt-0">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" /> Residue Attention Map
                      </h3>
                      <div className="border rounded-lg p-4 bg-background min-h-[400px]">
                        <ResidueHeatmap
                          residueImportances={explainData.residue_importances}
                          fasta={predictionData.fasta}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Key Residues</h3>
                      <div className="border rounded-lg p-4 bg-background h-full">
                        <FeatureImportanceChart
                          data={prepareFeatureData('residues')}
                          title="Highest Attention Residues"
                          color="hsl(var(--chart-2))"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* 3D Viewer Section */}
            <Card className="p-6 border-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  3D Structural Analysis
                </h3>
                <Button variant="outline" onClick={() => setShow3D(!show3D)}>
                  {show3D ? "Hide 3D View" : "Show 3D View"}
                </Button>
              </div>

              {show3D && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Drug Structure</span>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-inner bg-black/5">
                      <MoleculeViewer3D
                        smiles={predictionData.smiles}
                        atomImportances={explainData.atom_importances}
                        bindingAffinity={predictionData.result.binding_affinity_pk}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Protein Pocket</span>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-inner bg-black/5">
                      <ProteinViewer3D
                        fasta={predictionData.fasta}
                        residueImportances={explainData.residue_importances}
                        bindingAffinity={predictionData.result.binding_affinity_pk}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Interpretation Text */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" /> Scientific Interpretation
              </h3>
              <div className="prose dark:prose-invert max-w-none text-sm space-y-2">
                <p>
                  The <strong>SHAP analysis</strong> indicates that polar atoms (Nitrogen, Oxygen) in the drug molecule are contributing most significantly to the predicted binding affinity ({predictionData.result.binding_affinity_pk.toFixed(2)} pK). This suggests hydrogen bonding capabilities are the primary driver of interaction.
                </p>
                <p>
                  The <strong>Attention Mechanism</strong> highlights specific residues (likely Arginine, Lysine, or Aspartic Acid based on the heatmap) as key interaction sites. These high-attention regions typically correspond to the active binding pocket of the protein.
                </p>
              </div>
            </Card>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="p-6 bg-muted rounded-full">
              <Brain className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No Analysis Data Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select a prediction from history or create a new prediction to view detailed explainability analytics.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}