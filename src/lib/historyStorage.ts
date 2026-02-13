import { db } from './db';
import { PredictionRecord, HistoryFilters, HistoryStats } from '@/types/historyTypes';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

// Add a new prediction to history
export async function addPrediction(prediction: Omit<PredictionRecord, 'id' | 'timestamp'>): Promise<string> {
    const record: PredictionRecord = {
        ...prediction,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        isFavorite: false,
        notes: '',
        tags: []
    };

    await db.predictions.add(record);
    return record.id;
}

// Add a prediction with a specific timestamp (for demo/import purposes)
export async function addWithTimestamp(prediction: Omit<PredictionRecord, 'id'>): Promise<string> {
    const record: PredictionRecord = {
        ...prediction,
        id: crypto.randomUUID(),
        // isFavorite and notes should be in the input or default if not
        isFavorite: prediction.isFavorite || false,
        notes: prediction.notes || '',
        tags: prediction.tags || []
    };

    await db.predictions.add(record);
    return record.id;
}

// Get all predictions with optional filtering
export async function getPredictions(filters?: Partial<HistoryFilters>): Promise<PredictionRecord[]> {
    let query = db.predictions.toCollection();

    // Apply filters
    if (filters?.source && filters.source !== 'all') {
        query = query.filter(p => p.source === filters.source);
    }

    if (filters?.favoritesOnly) {
        query = query.filter(p => p.isFavorite);
    }

    if (filters?.dateRange?.start) {
        const startTime = startOfDay(filters.dateRange.start).getTime();
        query = query.filter(p => p.timestamp >= startTime);
    }

    if (filters?.dateRange?.end) {
        const endTime = endOfDay(filters.dateRange.end).getTime();
        query = query.filter(p => p.timestamp <= endTime);
    }

    let results = await query.reverse().sortBy('timestamp');

    // Apply additional filters
    if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        results = results.filter(p =>
            p.drugName.toLowerCase().includes(search) ||
            p.proteinName.toLowerCase().includes(search) ||
            p.smiles.toLowerCase().includes(search) ||
            p.notes.toLowerCase().includes(search)
        );
    }

    if (filters?.pkRange) {
        results = results.filter(p =>
            p.predictedPk >= filters.pkRange.min &&
            p.predictedPk <= filters.pkRange.max
        );
    }

    if (filters?.confidenceRange) {
        results = results.filter(p =>
            p.confidenceScore >= filters.confidenceRange.min &&
            p.confidenceScore <= filters.confidenceRange.max
        );
    }

    return results;
}

// Get a single prediction by ID
export async function getPrediction(id: string): Promise<PredictionRecord | undefined> {
    return await db.predictions.get(id);
}

// Update a prediction
export async function updatePrediction(id: string, updates: Partial<PredictionRecord>): Promise<void> {
    await db.predictions.update(id, updates);
}

// Delete a prediction
export async function deletePrediction(id: string): Promise<void> {
    await db.predictions.delete(id);
}

// Toggle favorite status
export async function toggleFavorite(id: string): Promise<void> {
    const prediction = await db.predictions.get(id);
    if (prediction) {
        await db.predictions.update(id, { isFavorite: !prediction.isFavorite });
    }
}

// Update notes
export async function updateNotes(id: string, notes: string): Promise<void> {
    await db.predictions.update(id, { notes });
}

// Get history statistics
export async function getHistoryStats(): Promise<HistoryStats> {
    const predictions = await db.predictions.toArray();

    if (predictions.length === 0) {
        return {
            totalPredictions: 0,
            averagePk: 0,
            averageConfidence: 0,
            mostTestedProtein: 'N/A',
            predictionsByDay: [],
            predictionsBySource: { single: 0, batch: 0 }
        };
    }

    // Calculate averages
    const totalPk = predictions.reduce((sum, p) => sum + p.predictedPk, 0);
    const totalConfidence = predictions.reduce((sum, p) => sum + p.confidenceScore, 0);

    // Find most tested protein
    const proteinCounts: Record<string, number> = {};
    predictions.forEach(p => {
        proteinCounts[p.proteinName] = (proteinCounts[p.proteinName] || 0) + 1;
    });
    const mostTestedProtein = Object.entries(proteinCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    // Group by day (last 30 days)
    const predictionsByDay = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = subDays(today, i);
        const dayStart = startOfDay(date).getTime();
        const dayEnd = endOfDay(date).getTime();
        const count = predictions.filter(p => p.timestamp >= dayStart && p.timestamp <= dayEnd).length;
        predictionsByDay.push({
            date: format(date, 'yyyy-MM-dd'),
            count
        });
    }

    // Count by source
    const predictionsBySource = {
        single: predictions.filter(p => p.source === 'single').length,
        batch: predictions.filter(p => p.source === 'batch').length
    };

    return {
        totalPredictions: predictions.length,
        averagePk: totalPk / predictions.length,
        averageConfidence: totalConfidence / predictions.length,
        mostTestedProtein,
        predictionsByDay,
        predictionsBySource
    };
}

// Clear all history
export async function clearAllHistory(): Promise<void> {
    await db.predictions.clear();
}

// Export all predictions as JSON
export async function exportAllPredictions(): Promise<PredictionRecord[]> {
    return await db.predictions.toArray();
}
