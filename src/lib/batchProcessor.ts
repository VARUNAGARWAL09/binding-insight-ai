import { BatchRow, BatchResult, BatchProgress } from '@/types/batchTypes';
import { predictBinding } from '@/lib/api';
import { addPrediction } from '@/lib/historyStorage';

/**
 * Process batch predictions with priority queue and progress tracking
 */
export class BatchProcessor {
    private results: BatchResult[] = [];
    private queue: BatchRow[] = [];
    private isProcessing = false;
    private onProgressUpdate?: (progress: BatchProgress) => void;
    private onComplete?: (results: BatchResult[]) => void;
    private startTime: number = 0;

    constructor(
        rows: BatchRow[],
        onProgressUpdate?: (progress: BatchProgress) => void,
        onComplete?: (results: BatchResult[]) => void
    ) {
        // Sort by priority (priority items first)
        this.queue = [...rows].sort((a, b) => {
            if (a.priority && !b.priority) return -1;
            if (!a.priority && b.priority) return 1;
            return 0;
        });

        this.onProgressUpdate = onProgressUpdate;
        this.onComplete = onComplete;

        // Initialize results with pending status
        this.results = this.queue.map(row => ({
            ...row,
            predicted_pk: null,
            confidence: null,
            status: 'pending' as const,
            timestamp: new Date()
        }));
    }

    /**
     * Start processing the batch
     */
    async start() {
        if (this.isProcessing) {
            console.warn('Batch processing already in progress');
            return;
        }

        this.isProcessing = true;
        this.startTime = Date.now();

        // Process in batches of 5 for better performance
        const batchSize = 5;
        for (let i = 0; i < this.queue.length; i += batchSize) {
            if (!this.isProcessing) break; // Allow cancellation

            const batch = this.queue.slice(i, i + batchSize);
            await Promise.all(batch.map((row, idx) => this.processRow(row, i + idx)));
        }

        this.isProcessing = false;
        if (this.onComplete) {
            this.onComplete(this.results);
        }
    }

    /**
   * Process a single row
   */
    private async processRow(row: BatchRow, index: number) {
        const result = this.results[index];
        result.status = 'processing';
        this.updateProgress(row.drug_name);

        try {
            // Call the prediction API with correct interface
            const prediction = await predictBinding({
                smiles: row.smiles,
                fasta: row.fasta,
                drugName: row.drug_name,
                proteinName: row.protein_name
            });

            result.predicted_pk = prediction.binding_affinity_pk;
            result.confidence = prediction.confidence_score * 100; // Store as percentage
            result.status = 'success';
            result.timestamp = new Date();

            // Save successful prediction to history
            await addPrediction({
                source: 'batch',
                drugName: row.drug_name,
                smiles: row.smiles,
                proteinName: row.protein_name,
                fasta: row.fasta,
                predictedPk: prediction.binding_affinity_pk,
                confidenceScore: prediction.confidence_score * 100, // Convert to percentage
                isFavorite: false,
                notes: '',
                tags: []
            });
        } catch (error) {
            result.status = 'failed';
            result.error = error instanceof Error ? error.message : 'Unknown error';
            result.timestamp = new Date();
        }

        this.updateProgress();
    }

    /**
     * Update progress and notify callback
     */
    private updateProgress(currentItem?: string) {
        const completed = this.results.filter(r => r.status === 'success' || r.status === 'failed').length;
        const successful = this.results.filter(r => r.status === 'success').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const total = this.results.length;
        const percentage = Math.round((completed / total) * 100);

        // Calculate ETA
        const elapsed = (Date.now() - this.startTime) / 1000; // seconds
        const rate = completed / elapsed; // items per second
        const remaining = total - completed;
        const eta = rate > 0 ? Math.round(remaining / rate) : 0;

        const progress: BatchProgress = {
            total,
            completed,
            successful,
            failed,
            percentage,
            eta,
            currentItem
        };

        if (this.onProgressUpdate) {
            this.onProgressUpdate(progress);
        }
    }

    /**
     * Cancel batch processing
     */
    cancel() {
        this.isProcessing = false;
    }

    /**
     * Get current results
     */
    getResults(): BatchResult[] {
        return this.results;
    }
}

/**
 * Save batch results to prediction history (legacy function for compatibility)
 * Note: Individual predictions are now saved automatically during processing
 */
export function saveBatchToHistory(results: BatchResult[]) {
    const successfulResults = results.filter(r => r.status === 'success');
    return successfulResults.length;
}
