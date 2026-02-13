import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseFile } from '@/lib/fileParser';
import { ParsedBatchData } from '@/types/batchTypes';
import { downloadTemplate } from '@/lib/exportUtils';

interface BatchFileUploadProps {
    onDataParsed: (data: ParsedBatchData) => void;
}

export default function BatchFileUpload({ onDataParsed }: BatchFileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback(async (file: File) => {
        setError(null);
        setIsProcessing(true);

        try {
            const result = await parseFile(file);
            onDataParsed(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse file');
        } finally {
            setIsProcessing(false);
        }
    }, [onDataParsed]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Upload Batch File</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Upload a CSV or Excel file with drug-protein pairs
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Download Template
                    </Button>
                </div>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center gap-4">
                        {isProcessing ? (
                            <>
                                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                <p className="text-sm text-muted-foreground">Processing file...</p>
                            </>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Drag and drop your file here, or click to browse
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Supports CSV and Excel (.xlsx) files
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileInput}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload">
                                    <Button variant="outline" size="sm" className="gap-2" asChild>
                                        <span>
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Choose File
                                        </span>
                                    </Button>
                                </label>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Required Columns:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <strong>drug_name</strong>: Name of the drug compound</li>
                        <li>• <strong>smiles</strong>: SMILES notation of the drug</li>
                        <li>• <strong>protein_name</strong>: Name of the target protein</li>
                        <li>• <strong>fasta</strong>: Protein sequence (30-10,000 amino acids)</li>
                        <li>• <strong>priority</strong> (optional): true/false for priority processing</li>
                    </ul>
                </div>
            </div>
        </Card>
    );
}
