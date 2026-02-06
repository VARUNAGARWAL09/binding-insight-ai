import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, FlaskConical, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DrugResult {
  name: string;
  smiles: string;
  molecular_weight?: number;
  formula?: string;
  description?: string;
}

interface ProteinResult {
  name: string;
  fasta: string;
  length?: number;
  uniprot_id?: string;
  description?: string;
}

interface MoleculeGeneratorProps {
  onDrugGenerated?: (smiles: string) => void;
  onProteinGenerated?: (fasta: string) => void;
  mode?: 'full' | 'drug-only' | 'protein-only';
}

export function MoleculeGenerator({
  onDrugGenerated,
  onProteinGenerated,
  mode = 'full'
}: MoleculeGeneratorProps) {
  const [drugName, setDrugName] = useState("");
  const [proteinName, setProteinName] = useState("");
  const [isLoadingDrug, setIsLoadingDrug] = useState(false);
  const [isLoadingProtein, setIsLoadingProtein] = useState(false);
  const [drugResult, setDrugResult] = useState<DrugResult | null>(null);
  const [proteinResult, setProteinResult] = useState<ProteinResult | null>(null);
  const [copiedSmiles, setCopiedSmiles] = useState(false);
  const [copiedFasta, setCopiedFasta] = useState(false);

  const generateDrug = async () => {
    if (!drugName.trim()) {
      toast.error("Please enter a drug name");
      return;
    }

    setIsLoadingDrug(true);
    setDrugResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-molecule', {
        body: { name: drugName, type: 'drug' },
      });

      if (error) throw new Error(error.message);

      setDrugResult(data);
      toast.success(`Generated SMILES for ${data.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate SMILES");
    } finally {
      setIsLoadingDrug(false);
    }
  };

  const generateProtein = async () => {
    if (!proteinName.trim()) {
      toast.error("Please enter a protein name");
      return;
    }

    setIsLoadingProtein(true);
    setProteinResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-molecule', {
        body: { name: proteinName, type: 'protein' },
      });

      if (error) throw new Error(error.message);

      setProteinResult(data);
      toast.success(`Generated FASTA for ${data.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate FASTA");
    } finally {
      setIsLoadingProtein(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'smiles' | 'fasta') => {
    await navigator.clipboard.writeText(text);
    if (type === 'smiles') {
      setCopiedSmiles(true);
      setTimeout(() => setCopiedSmiles(false), 2000);
    } else {
      setCopiedFasta(true);
      setTimeout(() => setCopiedFasta(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const useForPrediction = (text: string, type: 'smiles' | 'fasta') => {
    if (type === 'smiles' && onDrugGenerated) {
      onDrugGenerated(text);
      toast.success(mode === 'drug-only' ? "SMILES applied to calculator" : "SMILES applied to prediction input");
    } else if (type === 'fasta' && onProteinGenerated) {
      onProteinGenerated(text);
      toast.success("FASTA applied to prediction input");
    }
  };

  // Determine default tab based on mode
  const defaultTab = mode === 'protein-only' ? 'protein' : 'drug';

  return (
    <div className="card-scientific p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">AI Molecule Generator</h3>
          <p className="text-xs text-muted-foreground">
            {mode === 'drug-only' ? 'Generate SMILES from drug names' :
              mode === 'protein-only' ? 'Generate FASTA from protein names' :
                'Generate SMILES and FASTA from drug/protein names'}
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        {mode === 'full' && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="drug" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Drug → SMILES
            </TabsTrigger>
            <TabsTrigger value="protein" className="flex items-center gap-2">
              <Dna className="h-4 w-4" />
              Protein → FASTA
            </TabsTrigger>
          </TabsList>
        )}

        {(mode === 'full' || mode === 'drug-only') && (
          <TabsContent value="drug" className="space-y-4 data-[state=active]:block">
            <div className="space-y-2">
              <Label htmlFor="drugName">Drug Name</Label>
              <div className="flex gap-2">
                <Input
                  id="drugName"
                  placeholder="e.g., Aspirin, Metformin, Ibuprofen..."
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateDrug()}
                />
                <Button onClick={generateDrug} disabled={isLoadingDrug}>
                  {isLoadingDrug ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {drugResult && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{drugResult.name}</h4>
                  {drugResult.formula && (
                    <span className="text-xs font-mono text-muted-foreground">{drugResult.formula}</span>
                  )}
                </div>

                {drugResult.description && (
                  <p className="text-sm text-muted-foreground">{drugResult.description}</p>
                )}

                <div className="space-y-2">
                  <Label className="text-xs">SMILES Notation</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 text-xs bg-background rounded border font-mono break-all">
                      {drugResult.smiles}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(drugResult.smiles, 'smiles')}
                    >
                      {copiedSmiles ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {drugResult.molecular_weight && (
                  <p className="text-xs text-muted-foreground">
                    Molecular Weight: {drugResult.molecular_weight.toFixed(2)} g/mol
                  </p>
                )}

                {onDrugGenerated && (
                  <Button
                    variant="scientific"
                    size="sm"
                    className="w-full"
                    onClick={() => useForPrediction(drugResult.smiles, 'smiles')}
                  >
                    Use for Prediction
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        )}

        {(mode === 'full' || mode === 'protein-only') && (
          <TabsContent value="protein" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proteinName">Protein Name</Label>
              <div className="flex gap-2">
                <Input
                  id="proteinName"
                  placeholder="e.g., ACE2, EGFR, Insulin Receptor..."
                  value={proteinName}
                  onChange={(e) => setProteinName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateProtein()}
                />
                <Button onClick={generateProtein} disabled={isLoadingProtein}>
                  {isLoadingProtein ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {proteinResult && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{proteinResult.name}</h4>
                  {proteinResult.uniprot_id && proteinResult.uniprot_id !== 'N/A' && (
                    <span className="text-xs font-mono text-muted-foreground">UniProt: {proteinResult.uniprot_id}</span>
                  )}
                </div>

                {proteinResult.description && (
                  <p className="text-sm text-muted-foreground">{proteinResult.description}</p>
                )}

                <div className="space-y-2">
                  <Label className="text-xs">FASTA Sequence ({proteinResult.length || proteinResult.fasta.length} residues)</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 text-xs bg-background rounded border font-mono break-all max-h-24 overflow-y-auto">
                      {proteinResult.fasta.slice(0, 200)}...
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(proteinResult.fasta, 'fasta')}
                    >
                      {copiedFasta ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {onProteinGenerated && (
                  <Button
                    variant="scientific"
                    size="sm"
                    className="w-full"
                    onClick={() => useForPrediction(proteinResult.fasta, 'fasta')}
                  >
                    Use for Prediction
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}