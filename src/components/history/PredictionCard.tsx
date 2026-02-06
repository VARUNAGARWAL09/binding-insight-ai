import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Eye, MessageSquare } from 'lucide-react';
import { PredictionRecord } from '@/types/historyTypes';
import { formatDistanceToNow } from 'date-fns';

interface PredictionCardProps {
    prediction: PredictionRecord;
    onToggleFavorite: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    onAddNote: (id: string) => void;
}

export function PredictionCard({
    prediction,
    onToggleFavorite,
    onDelete,
    onView,
    onAddNote
}: PredictionCardProps) {
    const getAffinityColor = (pk: number) => {
        if (pk >= 9) return 'text-success';
        if (pk >= 7) return 'text-success';
        if (pk >= 5) return 'text-warning';
        return 'text-destructive';
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 0.85) return 'bg-success';
        if (score >= 0.65) return 'bg-warning';
        return 'bg-destructive';
    };

    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={prediction.source === 'single' ? 'default' : 'secondary'}>
                            {prediction.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(prediction.timestamp, { addSuffix: true })}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm text-muted-foreground">Drug:</span>
                            <span className="font-medium truncate">{prediction.drugName}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm text-muted-foreground">Protein:</span>
                            <span className="font-medium truncate">{prediction.proteinName}</span>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex items-center gap-4 mt-3">
                        <div>
                            <span className="text-xs text-muted-foreground">pK: </span>
                            <span className={`text-lg font-bold ${getAffinityColor(prediction.predictedPk)}`}>
                                {prediction.predictedPk.toFixed(2)}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">Confidence: </span>
                            <span className="text-sm font-semibold">
                                {prediction.confidenceScore.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Notes indicator */}
                    {prediction.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                            📝 {prediction.notes}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleFavorite(prediction.id)}
                        className={prediction.isFavorite ? 'text-warning' : ''}
                    >
                        <Star className={`h-4 w-4 ${prediction.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddNote(prediction.id)}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(prediction.id)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(prediction.id)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
