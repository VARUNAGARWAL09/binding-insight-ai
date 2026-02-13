import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { BatchProgress } from '@/types/batchTypes';

interface BatchProgressTrackerProps {
    progress: BatchProgress;
    isProcessing: boolean;
    onCancel?: () => void;
}

export default function BatchProgressTracker({
    progress,
    isProcessing,
    onCancel
}: BatchProgressTrackerProps) {
    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {isProcessing ? 'Processing Batch...' : 'Batch Complete'}
                    </h3>
                    {isProcessing && onCancel && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-medium">{progress.percentage}%</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            {progress.completed} of {progress.total} completed
                        </span>
                        {isProcessing && progress.eta > 0 && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                ETA: {formatTime(progress.eta)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">Processing</span>
                        </div>
                        <p className="text-2xl font-bold">{progress.total - progress.completed}</p>
                    </div>

                    <div className="bg-green-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700">Successful</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{progress.successful}</p>
                    </div>

                    <div className="bg-red-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-xs text-red-700">Failed</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">{progress.failed}</p>
                    </div>
                </div>

                {/* Current Item */}
                {isProcessing && progress.currentItem && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Currently processing:</p>
                        <p className="font-medium text-sm">{progress.currentItem}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
