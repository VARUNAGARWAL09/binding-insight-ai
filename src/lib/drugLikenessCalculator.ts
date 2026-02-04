// Drug-likeness calculator based on Lipinski's Rule of Five and other filters
// Analyzes SMILES notation to determine drug-like properties

export interface DrugLikenessResult {
    isValid: boolean;
    classification: 'Drug-like' | 'Lead-like' | 'Fragment-like' | 'Non-drug-like';
    violations: string[];
    properties: {
        molecularWeight: number;
        logP: number;
        hDonors: number;
        hAcceptors: number;
        rotatableBonds: number;
        polarSurfaceArea: number;
    };
    lipinskiViolations: number;
}

/**
 * Estimate molecular weight from SMILES string
 * This is a simplified approximation
 */
function estimateMolecularWeight(smiles: string): number {
    const atomicWeights: Record<string, number> = {
        'C': 12.01,
        'N': 14.01,
        'O': 16.00,
        'S': 32.07,
        'P': 30.97,
        'F': 19.00,
        'Cl': 35.45,
        'Br': 79.90,
        'I': 126.90,
        'H': 1.008,
    };

    let weight = 0;
    const matches = smiles.match(/Br|Cl|[CNOSPFIH]|\d+/g) || [];

    for (let i = 0; i < matches.length; i++) {
        const token = matches[i];
        if (atomicWeights[token]) {
            weight += atomicWeights[token];
        }
    }

    return Math.round(weight * 100) / 100;
}

/**
 * Count hydrogen bond donors (NH, OH groups)
 */
function countHDonors(smiles: string): number {
    const donors = (smiles.match(/[NH][H]?|OH/g) || []).length;
    return donors;
}

/**
 * Count hydrogen bond acceptors (N, O atoms)
 */
function countHAcceptors(smiles: string): number {
    const acceptors = (smiles.match(/[NO]/g) || []).length;
    return acceptors;
}

/**
 * Estimate LogP (octanol-water partition coefficient)
 * This is a very simplified Wildman-Crippen approximation
 */
function estimateLogP(smiles: string): number {
    const carbonCount = (smiles.match(/C/g) || []).length;
    const nitrogenCount = (smiles.match(/N/g) || []).length;
    const oxygenCount = (smiles.match(/O/g) || []).length;
    const sulfurCount = (smiles.match(/S/g) || []).length;
    const halogenCount = (smiles.match(/[FClBrI]/g) || []).length;

    // Wildman-Crippen atom contributions (simplified)
    const logP =
        (carbonCount * 0.35) +
        (nitrogenCount * -0.30) +
        (oxygenCount * -0.45) +
        (sulfurCount * 0.60) +
        (halogenCount * 0.20);

    return Math.round(logP * 100) / 100;
}

/**
 * Count rotatable bonds (single bonds not in rings)
 * Simplified: count single bonds that are not in cycles
 */
function countRotatableBonds(smiles: string): number {
    const singleBonds = (smiles.match(/-/g) || []).length;
    // Rough approximation
    return Math.floor(singleBonds * 0.6);
}

/**
 * Estimate polar surface area (PSA)
 * Simplified calculation based on oxygen and nitrogen counts
 */
function estimatePolarSurfaceArea(smiles: string): number {
    const oxygenCount = (smiles.match(/O/g) || []).length;
    const nitrogenCount = (smiles.match(/N/g) || []).length;

    // Approximate PSA contributions
    const psa = (oxygenCount * 20) + (nitrogenCount * 23.8);

    return Math.round(psa * 100) / 100;
}

/**
 * Calculate drug-likeness according to Lipinski's Rule of Five
 * Rule of Five criteria:
 * - Molecular weight ≤ 500 Da
 * - logP ≤ 5
 * - H-bond donors ≤ 5
 * - H-bond acceptors ≤ 10
 */
export function calculateDrugLikeness(smiles: string): DrugLikenessResult {
    if (!smiles || smiles.startsWith('INVALID')) {
        return {
            isValid: false,
            classification: 'Non-drug-like',
            violations: ['Invalid SMILES notation'],
            properties: {
                molecularWeight: 0,
                logP: 0,
                hDonors: 0,
                hAcceptors: 0,
                rotatableBonds: 0,
                polarSurfaceArea: 0,
            },
            lipinskiViolations: 4,
        };
    }

    const mw = estimateMolecularWeight(smiles);
    const logP = estimateLogP(smiles);
    const hDonors = countHDonors(smiles);
    const hAcceptors = countHAcceptors(smiles);
    const rotatableBonds = countRotatableBonds(smiles);
    const psa = estimatePolarSurfaceArea(smiles);

    const violations: string[] = [];
    let lipinskiViolations = 0;

    // Lipinski's Rule of Five
    if (mw > 500) {
        violations.push(`MW > 500 Da (${mw})`);
        lipinskiViolations++;
    }
    if (logP > 5) {
        violations.push(`LogP > 5 (${logP})`);
        lipinskiViolations++;
    }
    if (hDonors > 5) {
        violations.push(`H-donors > 5 (${hDonors})`);
        lipinskiViolations++;
    }
    if (hAcceptors > 10) {
        violations.push(`H-acceptors > 10 (${hAcceptors})`);
        lipinskiViolations++;
    }

    // Additional filters
    if (rotatableBonds > 10) {
        violations.push(`Rotatable bonds > 10 (${rotatableBonds})`);
    }
    if (psa > 140) {
        violations.push(`PSA > 140 Ų (${psa})`);
    }

    // Classification
    let classification: DrugLikenessResult['classification'];
    if (lipinskiViolations === 0 && violations.length === 0) {
        classification = 'Drug-like';
    } else if (lipinskiViolations <= 1 && mw < 450) {
        classification = 'Lead-like';
    } else if (mw < 300 && lipinskiViolations <= 2) {
        classification = 'Fragment-like';
    } else {
        classification = 'Non-drug-like';
    }

    return {
        isValid: true,
        classification,
        violations,
        properties: {
            molecularWeight: mw,
            logP,
            hDonors,
            hAcceptors,
            rotatableBonds,
            polarSurfaceArea: psa,
        },
        lipinskiViolations,
    };
}

/**
 * Get color class for drug-likeness badge
 */
export function getDrugLikenessColor(classification: DrugLikenessResult['classification']): string {
    switch (classification) {
        case 'Drug-like':
            return 'bg-success/10 text-success border-success/20';
        case 'Lead-like':
            return 'bg-primary/10 text-primary border-primary/20';
        case 'Fragment-like':
            return 'bg-warning/10 text-warning border-warning/20';
        case 'Non-drug-like':
            return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}
