// Prediction History Types

export interface PredictionRecord {
    id: string;                    // UUID
    timestamp: number;              // Unix timestamp
    source: 'single' | 'batch';    // Prediction source

    // Input data
    drugName: string;
    smiles: string;
    proteinName: string;
    fasta: string;

    // Results
    predictedPk: number;
    confidenceScore: number;
    drugLikenessScore?: number;    // Optional, for future

    // Metadata
    isFavorite: boolean;
    notes: string;
    tags: string[];                // For categorization
    atomImportance?: any[];        // Explainability data
    residueImportance?: any[];     // Explainability data
}

export interface HistoryFilters {
    searchQuery: string;
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    pkRange: {
        min: number;
        max: number;
    };
    confidenceRange: {
        min: number;
        max: number;
    };
    source: 'all' | 'single' | 'batch';
    favoritesOnly: boolean;
}

export interface HistoryStats {
    totalPredictions: number;
    averagePk: number;
    averageConfidence: number;
    mostTestedProtein: string;
    predictionsByDay: { date: string; count: number }[];
    predictionsBySource: { single: number; batch: number };
}

export interface ComparisonItem {
    id: string;
    record: PredictionRecord;
    selected: boolean;
}
