// Export utilities for dataset and prediction data
// Supports CSV and JSON formats

export type ExportFormat = 'csv' | 'json';

/**
 * Convert array of objects to CSV format
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const csvHeaders = headers.join(',');

  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download data as a file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string = 'export.csv') {
  const csv = convertToCSV(data);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any[], filename: string = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * Export dataset entries with all metadata
 */
export function exportDatasetEntries(entries: any[], format: ExportFormat = 'csv') {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `drugbind-dataset-${timestamp}`;

  // Flatten the data for better CSV export
  const flattenedEntries = entries.map(entry => ({
    id: entry.id,
    drug_name: entry.drugName || 'N/A',
    smiles: entry.smiles,
    protein_target: entry.target,
    uniprot_id: entry.uniprotId || 'N/A',
    pk_value: entry.pk,
    data_source: entry.source,
    valid: entry.valid,
    atom_importance: entry.atomImportance,
    residue_importance: entry.residueImportance,
    binding_site_score: entry.bindingSiteScore,
    hydrophobic_score: entry.hydrophobicScore,
    electrostatic_score: entry.electrostaticScore,
    hydrogen_bond_score: entry.hydrogenBondScore,
    van_der_waals_score: entry.vanDerWaalsScore,
    solvation_score: entry.solvationScore,
    entropy_score: entry.entropyScore,
    overall_confidence: entry.overallConfidence,
    // Truncate FASTA for CSV readability
    fasta_sequence: format === 'csv' ? entry.fasta.substring(0, 100) + '...' : entry.fasta,
  }));

  if (format === 'csv') {
    exportToCSV(flattenedEntries, `${filename}.csv`);
  } else {
    // Include full FASTA in JSON
    const fullEntries = entries.map(entry => ({
      ...entry,
      fasta: entry.fasta, // Full sequence in JSON
    }));
    exportToJSON(fullEntries, `${filename}.json`);
  }
}

/**
 * Export prediction history
 */
export interface PredictionRecord {
  timestamp: string;
  drugSmiles: string;
  proteinFasta: string;
  predictedPk: number;
  confidence: number;
  drugName?: string;
  targetName?: string;
}

export function exportPredictionHistory(predictions: PredictionRecord[], format: ExportFormat = 'csv') {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `prediction-history-${timestamp}`;

  const exportData = predictions.map(pred => ({
    timestamp: pred.timestamp,
    drug_name: pred.drugName || 'N/A',
    drug_smiles: pred.drugSmiles,
    target_name: pred.targetName || 'N/A',
    protein_fasta: format === 'csv' ? pred.proteinFasta.substring(0, 100) + '...' : pred.proteinFasta,
    predicted_pk: pred.predictedPk,
    confidence: pred.confidence,
  }));

  if (format === 'csv') {
    exportToCSV(exportData, `${filename}.csv`);
  } else {
    exportToJSON(predictions, `${filename}.json`);
  }
}

/**
 * Export filtered dataset results
 */
export function exportFilteredDataset(entries: any[], filterCriteria: string, format: ExportFormat = 'csv') {
  const timestamp = new Date().toISOString().split('T')[0];
  const criteriaSlug = filterCriteria.toLowerCase().replace(/\s+/g, '-').substring(0, 30);
  const filename = `dataset-${criteriaSlug}-${timestamp}`;

  exportDatasetEntries(entries, format);
}

/**
 * Generate template CSV file for batch upload
 */
export function downloadTemplate() {
  const template = `drug_name,smiles,protein_name,fasta,priority
Aspirin,CC(=O)OC1=CC=CC=C1C(=O)O,COX-2,MTKLIRNLALCPGPTLQQLHIDSLVRPEMVQIASQKITFPNWYYVGRKPKVENHTLFTLQYIRGFKELTQKLNLRQVTEHISGQPSLQVHVKRQEQLSPEQTQGPSPQTQSPQEQPQTQSPQEQPQTQSPQEQ,false
Ibuprofen,CC(C)CC1=CC=C(C=C1)C(C)C(=O)O,COX-1,MTKLIRNLALCPGPTLQQLHIDSLVRPEMVQIASQKITFPNWYYVGRKPKVENHTLFTLQYIRGFKELTQKLNLRQVTEHISGQPSLQVHVKRQEQLSPEQTQGPSPQTQSPQEQPQTQSPQEQPQTQSPQEQ,false
Caffeine,CN1C=NC2=C1C(=O)N(C(=O)N2C)C,Adenosine A2A,MPIMGSSVYITVELAIAVLAILGNVLVCWAVWLNSNLQNVTNYFVVSLAAADIAVGVLAIPFAITISTGFCAACHGCLFIACFVLVLTQSSIFSLLAIAIDRYIAIRIPLRYNGLVTGTRAKGIIAICWVLSFAIGLTPMLGWNNCGQPKEGKNHSQGCGEGQVACLFEDVVPMNYMVYFNFFACVLVPLLLMLGVYLRIFLAARRQLKQMESQPLPGERARSTLQKEVHAAKSLAIIVGLFALCWLPLHIINCFTFFCPDCSHAPLWLMYLAIVLSHTNSVVNPFIYAYRIREFRQTFRKIIRSHVLRQQEPFKAAGTSARVLAAHGSDGEQVSLRLNGHPPGVWANGSAPHPERRPNGYALGLVSGGSAQESQGNTGLPDVELLSHELKGVCPEPPGLDDPLAQDGAGVS,true`;

  downloadFile(template, 'batch_template.csv', 'text/csv;charset=utf-8;');
}
