import { useState, useEffect, useCallback, useRef } from 'react';
import { PredictionRecord, HistoryFilters, HistoryStats } from '@/types/historyTypes';
import {
    getPredictions,
    addPrediction,
    updatePrediction,
    deletePrediction,
    toggleFavorite,
    updateNotes,
    getHistoryStats
} from '@/lib/historyStorage';
import { initializeDatabase } from '@/lib/db';

export function useHistory(filters?: Partial<HistoryFilters>) {
    const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
    const [stats, setStats] = useState<HistoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);
    const filtersRef = useRef(filters);

    // Update filters ref when filters change
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Initialize database once on mount
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                await initializeDatabase();
                if (mounted) {
                    setInitialized(true);
                }
            } catch (err) {
                console.error('Failed to initialize database:', err);
                if (mounted) {
                    setError('Failed to initialize database');
                    setLoading(false);
                }
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, []);

    // Load predictions
    const loadPredictions = useCallback(async () => {
        if (!initialized) return;

        try {
            setLoading(true);
            setError(null);
            const data = await getPredictions(filtersRef.current);
            setPredictions(data);
        } catch (err) {
            console.error('Failed to load predictions:', err);
            setError('Failed to load predictions');
        } finally {
            setLoading(false);
        }
    }, [initialized]);

    // Load statistics
    const loadStats = useCallback(async () => {
        if (!initialized) return;

        try {
            const data = await getHistoryStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }, [initialized]);

    // Load data when initialized or filters change
    useEffect(() => {
        if (initialized) {
            loadPredictions();
            loadStats();
        }
    }, [initialized, loadPredictions, loadStats, filters]);

    // Add new prediction
    const add = useCallback(async (prediction: Omit<PredictionRecord, 'id' | 'timestamp'>) => {
        try {
            await addPrediction(prediction);
            await loadPredictions();
            await loadStats();
        } catch (err) {
            console.error('Failed to add prediction:', err);
            throw err;
        }
    }, [loadPredictions, loadStats]);

    // Update existing prediction
    const update = useCallback(async (id: string, updates: Partial<PredictionRecord>) => {
        try {
            await updatePrediction(id, updates);
            await loadPredictions();
        } catch (err) {
            console.error('Failed to update prediction:', err);
            throw err;
        }
    }, [loadPredictions]);

    // Delete prediction
    const remove = useCallback(async (id: string) => {
        try {
            await deletePrediction(id);
            await loadPredictions();
            await loadStats();
        } catch (err) {
            console.error('Failed to delete prediction:', err);
            throw err;
        }
    }, [loadPredictions, loadStats]);

    // Toggle favorite
    const toggleFav = useCallback(async (id: string) => {
        try {
            await toggleFavorite(id);
            await loadPredictions();
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            throw err;
        }
    }, [loadPredictions]);

    // Update notes
    const setNotes = useCallback(async (id: string, notes: string) => {
        try {
            await updateNotes(id, notes);
            await loadPredictions();
        } catch (err) {
            console.error('Failed to update notes:', err);
            throw err;
        }
    }, [loadPredictions]);

    // Refresh data
    const refresh = useCallback(async () => {
        await loadPredictions();
        await loadStats();
    }, [loadPredictions, loadStats]);

    return {
        predictions,
        stats,
        loading,
        error,
        add,
        update,
        remove,
        toggleFavorite: toggleFav,
        updateNotes: setNotes,
        refresh
    };
}
