import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import BatchFileUpload from '@/components/batch/BatchFileUpload';
import BatchProgressTracker from '@/components/batch/BatchProgressTracker';
import BatchResultsTable from '@/components/batch/BatchResultsTable';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { ParsedBatchData, BatchResult, BatchProgress, BatchRow } from '@/types/batchTypes';
import { BatchProcessor, saveBatchToHistory } from '@/lib/batchProcessor';
import { useToast } from '@/hooks/use-toast';

export default function BatchPrediction() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [parsedData, setParsedData] = useState<ParsedBatchData | null>(null);
    const [priorityMode, setPriorityMode] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<BatchProgress>({
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        percentage: 0,
        eta: 0
    });
    const [results, setResults] = useState<BatchResult[]>([]);
    const [processor, setProcessor] = useState<BatchProcessor | null>(null);

    const handleDataParsed = (data: ParsedBatchData) => {
        setParsedData(data);
        setResults([]);

        if (data.errors.length > 0) {
            toast({
                title: 'File Parsing Errors',
                description: data.errors.join(', '),
                variant: 'destructive'
            });
        } else if (data.warnings.length > 0) {
            toast({
                title: 'File Parsing Warnings',
                description: `${data.warnings.length} rows had issues and were skipped`,
                variant: 'default'
            });
        }
    };

    const handleStartProcessing = async () => {
        if (!parsedData || parsedData.rows.length === 0) {
            toast({
                title: 'No Data',
                description: 'Please upload a valid file first',
                variant: 'destructive'
            });
            return;
        }

        // Apply priority mode if enabled
        const rows: BatchRow[] = parsedData.rows.map(row => ({
            ...row,
            priority: priorityMode ? true : (row.priority || false)
        }));

        setIsProcessing(true);

        const batchProcessor = new BatchProcessor(
            rows,
            (prog) => setProgress(prog),
            (finalResults) => {
                setResults(finalResults);
                setIsProcessing(false);

                // Save to history
                const savedCount = saveBatchToHistory(finalResults);

                toast({
                    title: 'Batch Processing Complete',
                    description: `${progress.successful} successful predictions. ${savedCount} saved to history.`,
                });
            }
        );

        setProcessor(batchProcessor);
        await batchProcessor.start();
    };

    const handleCancel = () => {
        if (processor) {
            processor.cancel();
            setIsProcessing(false);
            toast({
                title: 'Batch Cancelled',
                description: 'Processing has been stopped',
                variant: 'default'
            });
        }
    };

    const handleReset = () => {
        setParsedData(null);
        setResults([]);
        setProgress({
            total: 0,
            completed: 0,
            successful: 0,
            failed: 0,
            percentage: 0,
            eta: 0
        });
        setProcessor(null);
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Batch Prediction</h1>
                            <p className="text-muted-foreground mt-1">
                                Process multiple drug-protein pairs in bulk
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* File Upload */}
                    <BatchFileUpload onDataParsed={handleDataParsed} />

                    {/* Parsed Data Summary */}
                    {parsedData && parsedData.rows.length > 0 && !isProcessing && results.length === 0 && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                Successfully parsed {parsedData.rows.length} drug-protein pairs.
                                {parsedData.warnings.length > 0 && ` ${parsedData.warnings.length} rows were skipped due to validation errors.`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Warnings */}
                    {parsedData && parsedData.warnings.length > 0 && (
                        <Alert variant="default">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1">
                                    <p className="font-medium">Validation Warnings ({parsedData.warnings.length}):</p>
                                    <ul className="text-sm space-y-1 mt-2 max-h-32 overflow-y-auto">
                                        {parsedData.warnings.slice(0, 10).map((warning, idx) => (
                                            <li key={idx} className="text-muted-foreground">• {warning}</li>
                                        ))}
                                        {parsedData.warnings.length > 10 && (
                                            <li className="text-muted-foreground italic">
                                                ... and {parsedData.warnings.length - 10} more
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Priority Mode & Start Button */}
                    {parsedData && parsedData.rows.length > 0 && !isProcessing && results.length === 0 && (
                        <div className="flex items-center justify-between p-6 border rounded-lg bg-card">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="priority-mode"
                                    checked={priorityMode}
                                    onCheckedChange={(checked) => setPriorityMode(checked as boolean)}
                                />
                                <Label htmlFor="priority-mode" className="cursor-pointer">
                                    <span className="font-medium">Priority Mode</span>
                                    <p className="text-sm text-muted-foreground">
                                        Process all items with high priority (urgent processing)
                                    </p>
                                </Label>
                            </div>
                            <Button
                                onClick={handleStartProcessing}
                                size="lg"
                                className="gap-2"
                            >
                                <Layers className="h-4 w-4" />
                                Start Batch Processing ({parsedData.rows.length} items)
                            </Button>
                        </div>
                    )}

                    {/* Progress Tracker */}
                    {(isProcessing || results.length > 0) && (
                        <BatchProgressTracker
                            progress={progress}
                            isProcessing={isProcessing}
                            onCancel={handleCancel}
                        />
                    )}

                    {/* Results Table */}
                    {results.length > 0 && (
                        <>
                            <BatchResultsTable results={results} />

                            {/* Action Buttons */}
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                >
                                    Process Another Batch
                                </Button>
                                <Button
                                    onClick={() => navigate('/prediction')}
                                    variant="default"
                                >
                                    Back to Single Prediction
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
