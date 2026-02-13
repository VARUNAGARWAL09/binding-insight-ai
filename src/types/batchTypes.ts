// Batch Prediction Types

export interface BatchRow {
    id: string;
    drug_name: string;
    smiles: string;
    protein_name: string;
    fasta: string;
    priority?: boolean;
}

export interface BatchResult {
    id: string;
    drug_name: string;
    protein_name: string;
    smiles: string;
    fasta: string;
    predicted_pk: number | null;
    confidence: number | null;
    status: 'pending' | 'processing' | 'success' | 'failed';
    error?: string;
    timestamp: Date;
}

export interface BatchProgress {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    percentage: number;
    eta: number; // seconds
    currentItem?: string;
}

export interface ParsedBatchData {
    rows: BatchRow[];
    errors: string[];
    warnings: string[];
}
