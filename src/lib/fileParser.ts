import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BatchRow, ParsedBatchData } from '@/types/batchTypes';

/**
 * Parse CSV file and extract batch prediction data
 */
export function parseCSV(file: File): Promise<ParsedBatchData> {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const { rows, errors, warnings } = validateBatchData(results.data as any[]);
                resolve({ rows, errors, warnings });
            },
            error: (error) => {
                resolve({
                    rows: [],
                    errors: [`CSV parsing error: ${error.message}`],
                    warnings: []
                });
            }
        });
    });
}

/**
 * Parse Excel file and extract batch prediction data
 */
export function parseExcel(file: File): Promise<ParsedBatchData> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                const { rows, errors, warnings } = validateBatchData(jsonData as any[]);
                resolve({ rows, errors, warnings });
            } catch (error) {
                resolve({
                    rows: [],
                    errors: [`Excel parsing error: ${(error as Error).message}`],
                    warnings: []
                });
            }
        };

        reader.onerror = () => {
            resolve({
                rows: [],
                errors: ['Failed to read Excel file'],
                warnings: []
            });
        };

        reader.readAsBinaryString(file);
    });
}

/**
 * Validate and transform raw data into BatchRow format
 */
function validateBatchData(data: any[]): {
    rows: BatchRow[];
    errors: string[];
    warnings: string[];
} {
    const rows: BatchRow[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || data.length === 0) {
        errors.push('No data found in file');
        return { rows, errors, warnings };
    }

    // Check for required columns
    const requiredColumns = ['drug_name', 'smiles', 'protein_name', 'fasta'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        return { rows, errors, warnings };
    }

    data.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because index is 0-based and header is row 1

        // Validate required fields
        if (!row.drug_name || !row.smiles || !row.protein_name || !row.fasta) {
            warnings.push(`Row ${rowNumber}: Missing required fields`);
            return;
        }

        // Basic SMILES validation (contains only valid characters)
        const smilesRegex = /^[A-Za-z0-9@+\-\[\]()=#$:.\/\\%]+$/;
        if (!smilesRegex.test(row.smiles)) {
            warnings.push(`Row ${rowNumber}: Invalid SMILES format for "${row.drug_name}"`);
            return;
        }

        // Basic FASTA validation (only amino acid letters)
        const fastaRegex = /^[ACDEFGHIKLMNPQRSTVWY]+$/i;
        const cleanFasta = row.fasta.replace(/\s/g, '').toUpperCase();
        if (!fastaRegex.test(cleanFasta)) {
            warnings.push(`Row ${rowNumber}: Invalid FASTA sequence for "${row.protein_name}"`);
            return;
        }

        // Check FASTA length
        if (cleanFasta.length < 30 || cleanFasta.length > 10000) {
            warnings.push(`Row ${rowNumber}: FASTA length must be between 30-10,000 amino acids`);
            return;
        }

        rows.push({
            id: `batch-${Date.now()}-${index}`,
            drug_name: String(row.drug_name).trim(),
            smiles: String(row.smiles).trim(),
            protein_name: String(row.protein_name).trim(),
            fasta: cleanFasta,
            priority: Boolean(row.priority)
        });
    });

    return { rows, errors, warnings };
}

/**
 * Parse file based on extension
 */
export async function parseFile(file: File): Promise<ParsedBatchData> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        return parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
        return parseExcel(file);
    } else {
        return {
            rows: [],
            errors: ['Unsupported file format. Please upload CSV or Excel (.xlsx) files.'],
            warnings: []
        };
    }
}
