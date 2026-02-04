import { Star, Trash2, Download, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FavoritePrediction } from "@/hooks/useFavorites";
import { exportToJSON } from "@/lib/exportUtils";
import { toast } from "sonner";
import { useState } from "react";

interface FavoritesListProps {
    favorites: FavoritePrediction[];
    onRemove: (id: string) => void;
    onUpdateNotes: (id: string, notes: string) => void;
    onLoadPrediction: (favorite: FavoritePrediction) => void;
}

export function FavoritesList({
    favorites,
    onRemove,
    onUpdateNotes,
    onLoadPrediction,
}: FavoritesListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
    const [notesText, setNotesText] = useState("");

    const handleExportFavorites = () => {
        exportToJSON(favorites, `favorites-${new Date().toISOString().split('T')[0]}.json`);
        toast.success('Favorites exported successfully!');
    };

    const handleEditNotes = (fav: FavoritePrediction) => {
        setEditingNotesId(fav.id);
        setNotesText(fav.notes || "");
    };

    const handleSaveNotes = (id: string) => {
        onUpdateNotes(id, notesText);
        setEditingNotesId(null);
        toast.success('Notes saved!');
    };

    if (favorites.length === 0) {
        return (
            <div className="text-center py-12">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
                <p className="text-sm text-muted-foreground">
                    Save predictions you want to revisit later by clicking the star icon
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                    Saved Predictions ({favorites.length})
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportFavorites}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                </Button>
            </div>

            <div className="grid gap-4">
                {favorites.map((fav) => (
                    <Card key={fav.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-foreground truncate">
                                            {fav.drugName || 'Drug Compound'}
                                            {fav.targetName && ` → ${fav.targetName}`}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(fav.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onLoadPrediction(fav)}
                                    >
                                        Load
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemove(fav.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-primary/5 p-3 border border-primary/20">
                                    <div className="text-xs text-muted-foreground mb-1">Predicted pK</div>
                                    <div className="text-xl font-bold text-foreground">
                                        {fav.predictedPk.toFixed(2)}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-success/5 p-3 border border-success/20">
                                    <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                                    <div className="text-xl font-bold text-foreground">
                                        {(fav.confidenceScore * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            {/* SMILES & FASTA Preview */}
                            {expandedId === fav.id && (
                                <div className="space-y-2 pt-2 border-t">
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-1">
                                            SMILES
                                        </div>
                                        <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                                            {fav.smiles}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-1">
                                            FASTA (preview)
                                        </div>
                                        <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                                            {fav.fasta.substring(0, 100)}...
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes Section */}
                            <div className="pt-2 border-t">
                                {editingNotesId === fav.id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={notesText}
                                            onChange={(e) => setNotesText(e.target.value)}
                                            placeholder="Add notes about this prediction..."
                                            className="min-h-[80px]"
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleSaveNotes(fav.id)}>
                                                Save Notes
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingNotesId(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {fav.notes ? (
                                            <div
                                                className="text-sm text-muted-foreground bg-muted/50 p-2 rounded cursor-pointer"
                                                onClick={() => handleEditNotes(fav)}
                                            >
                                                {fav.notes}
                                            </div>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditNotes(fav)}
                                                className="text-muted-foreground"
                                            >
                                                <FileText className="h-3 w-3 mr-1" />
                                                Add notes
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Toggle Details */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedId(expandedId === fav.id ? null : fav.id)}
                                className="w-full text-xs"
                            >
                                {expandedId === fav.id ? 'Hide' : 'Show'} Details
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
