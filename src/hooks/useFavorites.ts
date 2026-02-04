import { useState, useEffect } from 'react';

export interface FavoritePrediction {
    id: string;
    smiles: string;
    fasta: string;
    drugName?: string;
    targetName?: string;
    predictedPk: number;
    confidenceScore: number;
    timestamp: string;
    notes?: string;
}

const FAVORITES_KEY = 'drugbind_favorites';

export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoritePrediction[]>([]);
    const [loading, setLoading] = useState(true);

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setFavorites(parsed);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        if (!loading) {
            try {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            } catch (error) {
                console.error('Error saving favorites:', error);
            }
        }
    }, [favorites, loading]);

    const addFavorite = (
        prediction: Omit<FavoritePrediction, 'id' | 'timestamp'>
    ): FavoritePrediction => {
        const newFavorite: FavoritePrediction = {
            ...prediction,
            id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
        };

        setFavorites(prev => [newFavorite, ...prev]);
        return newFavorite;
    };

    const removeFavorite = (id: string) => {
        setFavorites(prev => prev.filter(fav => fav.id !== id));
    };

    const isFavorite = (smiles: string, fasta: string): boolean => {
        return favorites.some(
            fav => fav.smiles === smiles && fav.fasta === fasta
        );
    };

    const getFavorite = (smiles: string, fasta: string): FavoritePrediction | undefined => {
        return favorites.find(
            fav => fav.smiles === smiles && fav.fasta === fasta
        );
    };

    const updateFavoriteNotes = (id: string, notes: string) => {
        setFavorites(prev =>
            prev.map(fav => (fav.id === id ? { ...fav, notes } : fav))
        );
    };

    const clearAllFavorites = () => {
        if (confirm('Are you sure you want to clear all favorites?')) {
            setFavorites([]);
        }
    };

    return {
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite,
        getFavorite,
        updateFavoriteNotes,
        clearAllFavorites,
    };
}
