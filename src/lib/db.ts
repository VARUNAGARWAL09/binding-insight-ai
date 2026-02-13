import Dexie, { Table } from 'dexie';
import { PredictionRecord } from '@/types/historyTypes';

// Database class
export class PredictionDatabase extends Dexie {
    predictions!: Table<PredictionRecord, string>;

    constructor() {
        super('DrugBindAI');

        this.version(1).stores({
            predictions: 'id, timestamp, source, drugName, proteinName, isFavorite, predictedPk, confidenceScore'
        });
    }
}

// Create database instance
export const db = new PredictionDatabase();

// Migration function to import from localStorage
export async function migrateFromLocalStorage() {
    try {
        const existingCount = await db.predictions.count();
        if (existingCount > 0) {
            console.log('Database already has data, skipping migration');
            return;
        }

        // Get data from localStorage
        const historyData = localStorage.getItem('predictionHistory');
        if (!historyData) {
            console.log('No localStorage data to migrate');
            return;
        }

        const oldHistory = JSON.parse(historyData);

        // Transform old format to new format
        const records: PredictionRecord[] = oldHistory.map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            timestamp: item.timestamp || Date.now(),
            source: item.source || 'single',
            drugName: item.drugName || 'Unknown',
            smiles: item.smiles || '',
            proteinName: item.proteinName || 'Unknown',
            fasta: item.fasta || '',
            predictedPk: item.predictedPk || 0,
            confidenceScore: item.confidenceScore || 0,
            drugLikenessScore: item.drugLikenessScore,
            isFavorite: item.isFavorite || false,
            notes: item.notes || '',
            tags: item.tags || []
        }));

        // Bulk insert into IndexedDB
        await db.predictions.bulkAdd(records);
        console.log(`Migrated ${records.length} predictions from localStorage`);

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Initialize database and run migration
export async function initializeDatabase() {
    await db.open();
    await migrateFromLocalStorage();
}
