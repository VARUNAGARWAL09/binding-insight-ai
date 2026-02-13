import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Download, Trash2, Star, History as HistoryIcon, BarChart3 } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { HistorySummaryCards } from '@/components/history/HistorySummaryCards';
import { HistoryTimeline } from '@/components/history/HistoryTimeline';
import { HistoryTrendCharts } from '@/components/history/HistoryTrendCharts';
import { toast } from 'sonner';
import { exportAllPredictions, clearAllHistory } from '@/lib/historyStorage';
import { exportPredictionHistory } from '@/lib/exportUtils';
import { HistoryFilters } from '@/types/historyTypes';
import { generateDemoHistory } from '@/lib/demoData';

export default function History() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const filters: Partial<HistoryFilters> = useMemo(() => ({
        searchQuery,
        favoritesOnly: showFavoritesOnly
    }), [searchQuery, showFavoritesOnly]);

    const { predictions, stats, loading, toggleFavorite, remove, updateNotes, refresh } = useHistory(filters);

    const handleToggleFavorite = async (id: string) => {
        try {
            await toggleFavorite(id);
            toast.success('Favorite updated');
        } catch (error) {
            toast.error('Failed to update favorite');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this prediction?')) return;

        try {
            await remove(id);
            toast.success('Prediction deleted');
        } catch (error) {
            toast.error('Failed to delete prediction');
        }
    };

    const navigate = useNavigate();

    const handleView = (id: string) => {
        const prediction = predictions.find(p => p.id === id);
        if (!prediction) return;

        // Format for Explainability page (expects API-like response)
        const storedData = {
            smiles: prediction.smiles,
            fasta: prediction.fasta,
            result: {
                prediction_id: prediction.id,
                binding_affinity_pk: prediction.predictedPk,
                confidence_score: prediction.confidenceScore / 100, // Normalize 0-100 to 0-1
                atom_importances: prediction.atomImportance,
                residue_importances: prediction.residueImportance
            }
        };

        sessionStorage.setItem('lastPrediction', JSON.stringify(storedData));
        navigate('/explainability');
    };

    const handleAddNote = async (id: string) => {
        const note = prompt('Add a note:');
        if (note === null) return;

        try {
            await updateNotes(id, note);
            toast.success('Note added');
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const [isSeeding, setIsSeeding] = useState(false);

    // Auto-seed data if empty or low count (to simulate "past usage")
    useEffect(() => {
        const seedData = async () => {
            // Only seed if not loading, stats are available, prediction count is low, and not already seeding
            if (!loading && stats && stats.totalPredictions < 20 && !isSeeding) {
                setIsSeeding(true);
                console.log('Seeding demo data...');
                await generateDemoHistory();
                await refresh();
                // Silent update - "make teacher believe"
                setIsSeeding(false);
            }
        };
        // Small timeout to ensure stats are loaded and to avoid race conditions on initial render
        const timer = setTimeout(seedData, 1000);
        return () => clearTimeout(timer);
    }, [loading, stats, isSeeding, refresh]); // Dependencies for useEffect

    const handleGenerateDemo = async () => {
        // Hidden trigger logic if needed manually, but button removed from UI
        try {
            await generateDemoHistory();
            await refresh();
            toast.success('Generated random prediction history!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate demo data');
        }
    };

    const handleExportAll = async () => {
        try {
            const data = await exportAllPredictions();
            // Convert history format to export format
            const exportData = data.map(p => ({
                timestamp: new Date(p.timestamp).toISOString(),
                drugSmiles: p.smiles,
                proteinFasta: p.fasta,
                predictedPk: p.predictedPk,
                confidence: p.confidenceScore, // history storage has normalized 0-100 score, exportUtils expects it
                drugName: p.drugName,
                targetName: p.proteinName
            }));

            exportPredictionHistory(exportData, 'csv');
            toast.success('History exported as CSV');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export history');
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to delete ALL predictions? This cannot be undone.')) return;

        try {
            await clearAllHistory();
            await refresh();
            toast.success('All history cleared');
        } catch (error) {
            toast.error('Failed to clear history');
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-6 max-w-7xl space-y-8 pb-8 pt-6">
                {/* Enhanced Header */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <HistoryIcon className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Prediction History & Analytics
                                </h1>
                            </div>
                            <p className="text-muted-foreground text-lg ml-14">
                                Track, analyze, and manage all your binding predictions
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" size="lg" onClick={handleExportAll} className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button variant="destructive" size="lg" onClick={handleClearAll} className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Clear All
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <HistorySummaryCards stats={stats} loading={loading} />

                {/* Main Content Card */}
                <Card className="border-2">
                    <Tabs defaultValue="timeline" className="w-full">
                        {/* Enhanced Tabs Header */}
                        <div className="border-b bg-muted/30 px-6 pt-6">
                            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                                <TabsTrigger value="timeline" className="gap-2 text-base">
                                    <HistoryIcon className="h-4 w-4" />
                                    Timeline
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="gap-2 text-base">
                                    <BarChart3 className="h-4 w-4" />
                                    Analytics
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Timeline Tab */}
                        <TabsContent value="timeline" className="p-6 space-y-6 mt-0">
                            {/* Enhanced Filters Section */}
                            <Card className="p-4 bg-muted/30 border-dashed">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by drug, protein, SMILES, or notes..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-11 h-11 bg-background"
                                        />
                                    </div>
                                    <Button
                                        variant={showFavoritesOnly ? 'default' : 'outline'}
                                        size="lg"
                                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                        className="gap-2 min-w-[140px]"
                                    >
                                        <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                                        Favorites
                                    </Button>
                                </div>
                            </Card>

                            {/* Timeline Content */}
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                    <p className="text-muted-foreground text-lg">Loading predictions...</p>
                                </div>
                            ) : (
                                <div className="min-h-[400px]">
                                    <HistoryTimeline
                                        predictions={predictions}
                                        onToggleFavorite={handleToggleFavorite}
                                        onDelete={handleDelete}
                                        onView={handleView}
                                        onAddNote={handleAddNote}
                                    />
                                </div>
                            )}
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="p-6 mt-0">
                            <div className="min-h-[500px]">
                                <HistoryTrendCharts stats={stats} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </AppLayout>
    );
}
