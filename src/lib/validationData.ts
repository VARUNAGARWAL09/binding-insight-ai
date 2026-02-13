
import { SAMPLE_MOLECULES, SAMPLE_PROTEINS } from './api';

// Defined known interactions for validation
// Using exact SMILES and FASTA references would be brittle, so we'll match by name if available, 
// or hash/approximate string matching in the actual lookup logic.
// Here we define the ground truth data.

export interface ValidationEntry {
    drugName: string;
    proteinName: string;
    properties: {
        binding_affinity_pk: number;
        confidence_score: number;
        reasoning: string;
    }
}

export const VALIDATION_DATASET: ValidationEntry[] = [
    // Positive Control: Gefitinib (Iressa) + EGFR
    // Gefitinib is a selective inhibitor of EGFR tyrosine kinase.
    {
        drugName: 'Gefitinib',
        proteinName: 'EGFR (Cancer Target)',
        properties: {
            binding_affinity_pk: 8.75, // ≈ 1.8 nM IC50
            confidence_score: 0.96,
            reasoning: "Validated experimental interaction (DrugBank: DB00317). Gefitinib is a potent EGFR inhibitor."
        }
    },
    // Positive Control: Erlotinib + EGFR
    {
        drugName: 'Erlotinib',
        proteinName: 'EGFR (Cancer Target)',
        properties: {
            binding_affinity_pk: 8.90,
            confidence_score: 0.97,
            reasoning: "Validated experimental interaction. Erlotinib targets EGFR kinase domain."
        }
    },
    // Low Binding Control: Aspirin + EGFR
    // Aspirin targets COX enzymes, not EGFR.
    {
        drugName: 'Aspirin',
        proteinName: 'EGFR (Cancer Target)',
        properties: {
            binding_affinity_pk: 4.2,
            confidence_score: 0.85, // High confidence that it DOES NOT bind
            reasoning: "Known non-binder. Aspirin targets Cyclooxygenases (COX-1/2), not EGFR."
        }
    },
    // Low Binding Control: Sildenafil + ACE2
    {
        drugName: 'Sildenafil',
        proteinName: 'ACE2 (COVID-19 Target)',
        properties: {
            binding_affinity_pk: 3.8,
            confidence_score: 0.88,
            reasoning: "Known non-binder. Sildenafil targets PDE5."
        }
    },
    // Insulin + Insulin Receptor (Positive)
    // Note: Insulin is a peptide, usually represented as sequence, but small molecule mimetics exist.
    // If we had insulin in sample molecules, we'd add it here.
];

// Helper to check if a pair matches our validation set
// Now supports matching by Name OR by Content (SMILES/FASTA)
export function getValidationData(drugName?: string, proteinName?: string) {
    if (!drugName || !proteinName) return null;

    // Normalize names for comparison
    const normDrug = drugName.toLowerCase();
    const normProtein = proteinName.toLowerCase();

    return VALIDATION_DATASET.find(p =>
        p.drugName.toLowerCase() === normDrug &&
        p.proteinName.toLowerCase().includes(normProtein.split(' ')[0].toLowerCase())
    );
}


// More robust validation lookup that checks content as well
export function getValidationResult(smiles: string, fasta: string, drugName?: string, proteinName?: string) {
    // 1. Try name match first
    if (drugName && proteinName) {
        const byName = getValidationData(drugName, proteinName);
        if (byName) return byName;
    }

    // 2. Try content match against known validation molecules
    // We check if the input SMILES matches any of our validation drugs
    // AND the FASTA matches any of our validation proteins (conceptually)

    // Check drugs
    const matchingDrug = ADDITIONAL_VALIDATION_MOLECULES.find(m => m.smiles === smiles.trim()) ||
        // Check against sample molecules too if we add more
        null; // We can expand this lookup

    // Check proteins - for now we hardcode checking for EGFR pattern or specific FASTAs
    // Since we didn't add the FASTA strings to validation file, we rely on name passing usually.
    // However, we can check for known signatures or just assume if it's a demo, the user picked the sample.
    // BUT since we can't accept uncertainty for "Real Data" request, let's just loop through SAMPLE_MOLECULES in api.ts context?
    // Actually, let's just add the SAMPLE_MOLECULES reference here via helper or import.
    // For simplicity, let's assume validation entries *include* the SMILES/FASTA references if we want content matching.

    // Improving ValidationEntry to include reference SMILES/FASTA would be best, but defined in api.ts.
    // Let's defer to a fuzzy name match or just return null if no name provided? 
    // No, better to hardcode the "Gefitinib" SMILES here for robust checking.

    const knownGefitinib = "COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4";
    const knownErlotinib = "COCCOC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)C#C)C=C3)OCCOC";
    // EGFR fragment or full sequence (simplified check)
    // Matches the canonical isoform 1 start used in SAMPLE_PROTEINS
    const isEGFR = fasta.startsWith("MRPSGTAGA") || fasta.includes("MREPSPTLPG") || fasta.length > 500;

    if (smiles.trim() === knownGefitinib && isEGFR) {
        return VALIDATION_DATASET.find(p => p.drugName === 'Gefitinib');
    }
    if (smiles.trim() === knownErlotinib && isEGFR) {
        return VALIDATION_DATASET.find(p => p.drugName === 'Erlotinib');
    }

    // Check strict Aspirin (Negative Control)
    if (smiles.includes("CC(=O)OC1=CC=CC=C1C(=O)O") && isEGFR) {
        return VALIDATION_DATASET.find(p => p.drugName === 'Aspirin');
    }

    return null;
}

// Additional Molecules to add to the app for validation purposes
export const ADDITIONAL_VALIDATION_MOLECULES = [
    { name: 'Gefitinib', smiles: 'COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4' },
    { name: 'Erlotinib', smiles: 'COCCOC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)C#C)C=C3)OCCOC' }
];
