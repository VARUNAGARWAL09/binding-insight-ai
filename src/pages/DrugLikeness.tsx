
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateDrugLikeness, DrugLikenessResult, getDrugLikenessColor } from '@/lib/drugLikenessCalculator';
import { DrugLikenessRadar } from '@/components/drug-likeness/DrugLikenessRadar';
import { AdmetCards } from '@/components/drug-likeness/AdmetCards';
import { generateDrugLikenessPDF } from '@/lib/pdfGenerator';
import { MoleculeGenerator } from '@/components/prediction/MoleculeGenerator';
import { Search, FlaskConical, AlertTriangle, CheckCircle2, XCircle, Info, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function DrugLikeness() {
    const [smiles, setSmiles] = useState('CC(=O)OC1=CC=CC=C1C(=O)O'); // Default aspirin
    const [result, setResult] = useState<DrugLikenessResult | null>(null);

    const handleCalculate = () => {
        if (!smiles.trim()) {
            toast.error('Please enter a SMILES string');
            return;
        }

        try {
            const data = calculateDrugLikeness(smiles);
            setResult(data);
            if (data.isValid) {
                toast.success('Drug-likeness calculated successfully');
            } else {
                toast.error('Invalid SMILES format');
            }
        } catch (error) {
            toast.error('Calculation failed');
        }
    };

    const handleDownload = () => {
        if (!result) return;
        try {
            generateDrugLikenessPDF(result, smiles);
            toast.success('Report downloaded successfully');
        } catch (error) {
            toast.error('Failed to generate report');
            console.error(error);
        }
    };

    // Calculate on mount
    useState(() => {
        handleCalculate();
    });

    const getScoreColor = (score: number) => {
        if (score >= 0.67) return 'text-green-500';
        if (score >= 0.34) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-6 max-w-7xl pb-8 pt-6 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <FlaskConical className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Drug-Likeness Calculator
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Evaluate molecular properties against Lipinski, Ghose, and Veber rules
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Generator */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <MoleculeGenerator
                        mode="drug-only"
                        onDrugGenerated={(generatedSmiles) => {
                            setSmiles(generatedSmiles);
                            // Optional: auto-evaluate? Or let user click evaluate.
                            // Let's let user click evaluate to review the SMILES first.
                        }}
                    />
                </div>

                {/* Input Section */}
                <Card className="p-6 border-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Enter SMILES string (e.g., CC(=O)OC1=CC=CC=C1C(=O)O)"
                                value={smiles}
                                onChange={(e) => setSmiles(e.target.value)}
                                className="pl-11 h-12 text-lg font-mono"
                            />
                        </div>
                        <Button size="lg" onClick={handleCalculate} className="min-w-[150px] h-12 text-lg">
                            Evaluate
                        </Button>
                    </div>
                </Card>

                {result && result.isValid && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Results Header with Download */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Analysis Results</h2>
                            <Button variant="outline" onClick={handleDownload} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download PDF Report
                            </Button>
                        </div>

                        {/* Top Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Classification */}
                            <Card className="p-6 flex items-center justify-between border-l-8 border-l-primary bg-gradient-to-br from-background to-muted/30">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Classification</p>
                                    <h3 className="text-3xl font-bold mt-1">{result.classification}</h3>
                                </div>
                                <Badge className={`text-lg px-4 py-1 ${getDrugLikenessColor(result.classification)}`}>
                                    {result.classification}
                                </Badge>
                            </Card>

                            {/* QED Score */}
                            <Card className="p-6 flex items-center justify-between border-l-8 border-l-blue-500">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">QED Score</p>
                                    <h3 className={`text-4xl font-bold mt-1 ${getScoreColor(result.qedScore)}`}>
                                        {result.qedScore.toFixed(2)}
                                    </h3>
                                </div>
                                <div className="h-16 w-16 rounded-full border-4 border-muted flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-current border-t-transparent animate-spin-slow opacity-25" />
                                    <span className="font-bold text-xl">{Math.round(result.qedScore * 100)}%</span>
                                </div>
                            </Card>

                            {/* Rule Violations */}
                            <Card className={`p-6 flex items-center justify-between border-l-8 ${result.violations.length === 0 ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rule Violations</p>
                                    <h3 className="text-3xl font-bold mt-1">{result.violations.length}</h3>
                                </div>
                                {result.violations.length === 0 ? (
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-12 w-12 text-orange-500" />
                                )}
                            </Card>
                        </div>

                        {/* Visualizations Grid */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Radar Chart */}
                            <div className="lg:col-span-1">
                                <DrugLikenessRadar properties={result.properties} />
                            </div>

                            {/* Detailed Metrics */}
                            <Card className="lg:col-span-2 p-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="h-6 w-6 text-primary" /> Rule Analysis
                                </h3>

                                <div className="space-y-6">
                                    {/* Lipinski */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                Lipinski's Rule of Five
                                                <Badge variant={result.rules.lipinski.passed ? "outline" : "destructive"} className="ml-2">
                                                    {result.rules.lipinski.passed ? "Passed" : "Failed"}
                                                </Badge>
                                            </h4>
                                            <span className="text-sm text-muted-foreground">Oral Bioavailability</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <MetricItem label="Mol. Weight" value={`${result.properties.molecularWeight} Da`} limit="≤ 500" active={result.properties.molecularWeight <= 500} />
                                            <MetricItem label="LogP" value={result.properties.logP} limit="≤ 5" active={result.properties.logP <= 5} />
                                            <MetricItem label="H-Donors" value={result.properties.hDonors} limit="≤ 5" active={result.properties.hDonors <= 5} />
                                            <MetricItem label="H-Acceptors" value={result.properties.hAcceptors} limit="≤ 10" active={result.properties.hAcceptors <= 10} />
                                        </div>
                                    </div>

                                    {/* Veber */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                Veber's Rules
                                                <Badge variant={result.rules.veber.passed ? "outline" : "destructive"} className="ml-2">
                                                    {result.rules.veber.passed ? "Passed" : "Failed"}
                                                </Badge>
                                            </h4>
                                            <span className="text-sm text-muted-foreground">Membrane Permeability</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <MetricItem label="Rot. Bonds" value={result.properties.rotatableBonds} limit="≤ 10" active={result.properties.rotatableBonds <= 10} />
                                            <MetricItem label="TPSA" value={`${result.properties.polarSurfaceArea} Å²`} limit="≤ 140" active={result.properties.polarSurfaceArea <= 140} />
                                        </div>
                                    </div>

                                    {/* Ghose */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                Ghose Filter
                                                <Badge variant={result.rules.ghose.passed ? "outline" : "destructive"} className="ml-2">
                                                    {result.rules.ghose.passed ? "Passed" : "Failed"}
                                                </Badge>
                                            </h4>
                                            <span className="text-sm text-muted-foreground">Drug-likeness Range</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <MetricItem label="Mol. Weight" value={`${result.properties.molecularWeight} Da`} limit="160 - 480" active={result.properties.molecularWeight >= 160 && result.properties.molecularWeight <= 480} />
                                            <MetricItem label="LogP" value={result.properties.logP} limit="-0.4 - 5.6" active={result.properties.logP >= -0.4 && result.properties.logP <= 5.6} />
                                            <MetricItem label="Mol. Refractivity" value={result.properties.molarRefractivity} limit="40 - 130" active={result.properties.molarRefractivity >= 40 && result.properties.molarRefractivity <= 130} />
                                            <MetricItem label="Atom Count" value={result.properties.atomCount} limit="20 - 70" active={result.properties.atomCount >= 20 && result.properties.atomCount <= 70} />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* ADMET Section */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <FlaskConical className="h-6 w-6 text-primary" /> ADMET Profile (Predicted)
                            </h3>
                            <AdmetCards admet={result.admet} />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function MetricItem({ label, value, limit, active }: { label: string, value: string | number, limit: string, active: boolean }) {
    return (
        <div className={`p-3 rounded-lg border ${active ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800'}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-bold text-lg">{value}</p>
            <p className="text-xs opacity-70">Target: {limit}</p>
        </div>
    );
}
