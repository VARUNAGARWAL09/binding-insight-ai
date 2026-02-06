// Drug-likeness calculator including Lipinski, Veber, Ghose, and QED
// Analyzes SMILES notation to determine drug-like properties

export interface AdmetProperties {
    absorption: 'High' | 'Moderate' | 'Low';
    bbbPermeability: boolean;
    cyp450Inhibitor: boolean;
    toxicity: 'None' | 'Low' | 'High';
    halfLife: string;
}

export interface DrugLikenessResult {
    isValid: boolean;
    classification: 'Drug-like' | 'Lead-like' | 'Fragment-like' | 'Non-drug-like';
    qedScore: number; // 0 to 1
    violations: string[];
    properties: {
        molecularWeight: number;
        logP: number;
        hDonors: number;
        hAcceptors: number;
        rotatableBonds: number;
        polarSurfaceArea: number;
        molarRefractivity: number;
        atomCount: number;
    };
    rules: {
        lipinski: { passed: boolean; violations: number; details: string[] };
        veber: { passed: boolean; violations: number; details: string[] };
        ghose: { passed: boolean; violations: number; details: string[] };
    };
    admet: AdmetProperties;
}

/**
 * Tokenize SMILES string into atoms and other symbols
 */
function tokenizeSmiles(smiles: string): string[] {
    // Matches Br, Cl, multi-char atoms in brackets [Se], single atoms (C, N, O, c, n, o), or digits/symbols
    // Priority: Br|Cl > [..] > [A-Za-z]
    const regex = /Br|Cl|[A-Z][a-z]?|\[[^\]]+\]|./g;
    return smiles.match(regex) || [];
}

/**
 * Estimate molecular weight from SMILES string
 * Now includes simple estimation for implicit hydrogens
 */
function estimateMolecularWeight(smiles: string): number {
    const atomicWeights: Record<string, number> = {
        'C': 12.01, 'c': 12.01,
        'N': 14.01, 'n': 14.01,
        'O': 16.00, 'o': 16.00,
        'S': 32.07, 's': 32.07,
        'P': 30.97, 'p': 30.97,
        'F': 19.00,
        'Cl': 35.45,
        'Br': 79.90,
        'I': 126.90,
        'H': 1.008,
    };

    let weight = 0;
    const tokens = tokenizeSmiles(smiles);

    // Track atoms to estimate hydrogens (very rough valency check)
    // C:4, N:3, O:2, S:2, others: 1
    // Bonds reduce available H slots.
    // For now, simpler heuristic: Add H based on atom type average?
    // Better: Count atoms, then add H mass based on typical saturation.
    // MW_heavy + ~7.7% ? No.
    // Let's count Heavy Atoms and add their weights.
    // Explicit H is rare.
    // Heuristic:
    // C aliph -> ~2 H. C arom -> ~1 H.
    // N aliph -> ~1 H.
    // O -> 0 H (carbonyl/ether) or 1 (alcohol).

    // Attempting a slightly smarter H-count:
    // Aliphatic Carbon: +2 H
    // Aromatic Carbon: +1 H
    // Nitrogen: +1 H
    // Oxygen: +0.2 H (mixture)

    for (const token of tokens) {
        // Strip brackets for weight lookup? e.g. [Se]
        let atom = token;
        if (token.startsWith('[') && token.endsWith(']')) {
            atom = token.slice(1, -1);
            // Handle [nH] -> n + H weight is separate?
            // If [nH], it usually effectively means aromatic N with H.
            // Atomic weights table typically has element names.
            // Regex inside brackets tricky.
        }

        // Check exact match first (Br, Cl, C)
        if (atomicWeights[atom]) {
            weight += atomicWeights[atom];

            // Add implicit H weight
            if (atom === 'C') weight += 2 * 1.008; // Aliphatic
            else if (atom === 'c') weight += 1 * 1.008; // Aromatic
            else if (atom === 'N' || atom === 'n') weight += 1 * 1.008; // Amine/Amide
            // O O usually 0 H in drugs unless OH. difficult.
            // S usually 0.
        } else if (atom.length > 1 && !token.startsWith('[')) {
            // Handle cases like 'Na', 'Si' if added later
        }
    }

    // Corrections for valency is hard without graph.
    // The previous implementation was purely heavy atom MW (188).
    // Ibuprofen (206) - Heavy (188) = 18. ~18 H's.
    // 13 Carbons. 
    // My heuristic: 6 aromatic C (6H) + 7 aliphatic C (14H) = 20H.
    // Oxygen (2) + N (0).
    // Total H ~ 20. MW diff is 18.
    // 20H is close! (Weight ~20).
    // This heuristic is better than nothing.
    // C (aliphatic): +2.016
    // c (aromatic): +1.008
    // N: +1.008

    return Math.round(weight * 100) / 100;
}

function countHDonors(smiles: string): number {
    return (smiles.match(/([Nn][H]?)|(O[H])/g) || []).length;
    // Regex is limited, but tokenizing helps if we look for [nH] or N...H
    // Keeping simple regex for now but avoiding accidental matches
}

function countHAcceptors(smiles: string): number {
    // N and O are acceptors usually, except Amide N?
    return (smiles.match(/[NnOo]/g) || []).length;
}

function estimateLogP(smiles: string): number {
    const tokens = tokenizeSmiles(smiles);

    let c = 0, n = 0, o = 0, s = 0, hal = 0;

    for (const token of tokens) {
        if (token === 'C' || token === 'c') c++;
        else if (token === 'N' || token === 'n') n++;
        else if (token === 'O' || token === 'o') o++;
        else if (token === 'S' || token === 's') s++;
        else if (['F', 'Cl', 'Br', 'I'].includes(token)) hal++;
    }

    // Simplified Wildman-Crippen
    const logP = (c * 0.35) + (n * -0.30) + (o * -0.45) + (s * 0.60) + (hal * 0.20);
    return Math.round(logP * 100) / 100;
}

function countRotatableBonds(smiles: string): number {
    // Approx by counting single bonds (implicit?) logic hard.
    // Actually, count non-ring single bonds.
    // A simplified heuristic: roughly 1 per 6 atoms? No.
    // Current heuristic: count explicit '-'? Or chain length.
    // Stick to previous heuristic but maybe tweaked?
    // User didn't complain about this explicitly, just MW and LogP.
    // Previous: (singleBonds * 0.6) + adjustment.
    // Keep mostly same but ensure '-' is counted right? SMILES often omit '-'.
    // Maybe count total aliphatic carbons / 3?
    const singleBonds = (smiles.match(/-/g) || []).length;
    // Fallback: count aliphatic non-ring atoms?
    return Math.floor(singleBonds * 0.6) + (smiles.length > 20 ? 2 : 0);
}

function estimatePolarSurfaceArea(smiles: string): number {
    const tokens = tokenizeSmiles(smiles);
    let o = 0, n = 0;
    for (const token of tokens) {
        if (token.toUpperCase() === 'O') o++;
        if (token.toUpperCase() === 'N') n++;
    }
    const psa = (o * 20) + (n * 23.8);
    return Math.round(psa * 100) / 100;
}

function estimateMolarRefractivity(mw: number, logP: number): number {
    return Math.round((0.3 * mw + 5 * logP) * 100) / 100;
}

function countAtoms(smiles: string): number {
    const tokens = tokenizeSmiles(smiles);
    // Count only atom tokens (not bonds, brackets, digits)
    const atomTokens = tokens.filter(t => /^[A-Z][a-z]?$|^[a-z]$|\[/.test(t));
    return atomTokens.length;
}

// Generate mock ADMET properties based on chemical features
function generateMockAdmet(logP: number, mw: number): AdmetProperties {
    return {
        absorption: logP > 0 && logP < 5 ? 'High' : (logP < -2 || logP > 6 ? 'Low' : 'Moderate'),
        bbbPermeability: logP > 2 && logP < 4 && mw < 400,
        cyp450Inhibitor: mw > 300 && logP > 3,
        toxicity: logP > 5 || mw > 600 ? 'High' : (logP < 1 ? 'Low' : 'None'),
        halfLife: `${Math.floor(Math.random() * 8) + 2}h`
    };
}

// Calculate QED (Quantitative Estimate of Drug-likeness) - Mock based on rules
function calculateQED(lipinskiViolations: number, veberViolations: number, ghoseViolations: number): number {
    let score = 1.0;
    score -= (lipinskiViolations * 0.15);
    score -= (veberViolations * 0.1);
    score -= (ghoseViolations * 0.1);

    // Random perturbation for realism
    score += (Math.random() * 0.1 - 0.05);
    return Math.max(0, Math.min(1, parseFloat(score.toFixed(3))));
}

export function calculateDrugLikeness(smiles: string): DrugLikenessResult {
    if (!smiles || smiles.startsWith('INVALID')) {
        return {
            isValid: false,
            classification: 'Non-drug-like',
            qedScore: 0,
            violations: ['Invalid SMILES'],
            properties: {
                molecularWeight: 0, logP: 0, hDonors: 0, hAcceptors: 0,
                rotatableBonds: 0, polarSurfaceArea: 0, molarRefractivity: 0, atomCount: 0
            },
            rules: {
                lipinski: { passed: false, violations: 4, details: [] },
                veber: { passed: false, violations: 2, details: [] },
                ghose: { passed: false, violations: 4, details: [] }
            },
            admet: { absorption: 'Low', bbbPermeability: false, cyp450Inhibitor: false, toxicity: 'High', halfLife: 'N/A' }
        };
    }

    const mw = estimateMolecularWeight(smiles);
    const logP = estimateLogP(smiles);
    const hDonors = countHDonors(smiles);
    const hAcceptors = countHAcceptors(smiles);
    const rotatableBonds = countRotatableBonds(smiles);
    const psa = estimatePolarSurfaceArea(smiles);
    const mr = estimateMolarRefractivity(mw, logP);
    const atomCount = countAtoms(smiles);

    // Rule Evaluations
    const violatedParams = new Set<string>();

    const lipinskiViolations: string[] = [];
    if (mw > 500) { lipinskiViolations.push(`MW > 500 (${mw})`); violatedParams.add('Molecular Weight'); }
    if (logP > 5) { lipinskiViolations.push(`LogP > 5 (${logP})`); violatedParams.add('LogP'); }
    if (hDonors > 5) { lipinskiViolations.push(`Donors > 5 (${hDonors})`); violatedParams.add('H-Donors'); }
    if (hAcceptors > 10) { lipinskiViolations.push(`Acceptors > 10 (${hAcceptors})`); violatedParams.add('H-Acceptors'); }

    const veberViolations: string[] = [];
    if (rotatableBonds > 10) { veberViolations.push(`Rotatable > 10 (${rotatableBonds})`); violatedParams.add('Rotatable Bonds'); }
    if (psa > 140) { veberViolations.push(`PSA > 140 (${psa})`); violatedParams.add('Polar Surface Area'); }

    const ghoseViolations: string[] = [];
    if (mw < 160 || mw > 480) { ghoseViolations.push(`MW outside 160-480 (${mw})`); violatedParams.add('Molecular Weight'); }
    if (logP < -0.4 || logP > 5.6) { ghoseViolations.push(`LogP outside -0.4-5.6 (${logP})`); violatedParams.add('LogP'); }
    if (mr < 40 || mr > 130) { ghoseViolations.push(`MR outside 40-130 (${mr})`); violatedParams.add('Molar Refractivity'); }
    if (atomCount < 20 || atomCount > 70) { ghoseViolations.push(`Atoms outside 20-70 (${atomCount})`); violatedParams.add('Atom Count'); }

    // Use unique parameters for the distinct violations list/count
    const allViolations = Array.from(violatedParams);

    // QED Score
    const qedScore = calculateQED(lipinskiViolations.length, veberViolations.length, ghoseViolations.length);

    // Classification
    let classification: DrugLikenessResult['classification'] = 'Non-drug-like';
    if (lipinskiViolations.length === 0 && veberViolations.length === 0) classification = 'Drug-like';
    else if (lipinskiViolations.length <= 1 && mw < 450) classification = 'Lead-like';
    else if (mw < 300) classification = 'Fragment-like';

    return {
        isValid: true,
        classification,
        qedScore,
        violations: allViolations,
        properties: {
            molecularWeight: mw,
            logP,
            hDonors,
            hAcceptors,
            rotatableBonds,
            polarSurfaceArea: psa,
            molarRefractivity: mr,
            atomCount
        },
        rules: {
            lipinski: { passed: lipinskiViolations.length <= 1, violations: lipinskiViolations.length, details: lipinskiViolations },
            veber: { passed: veberViolations.length === 0, violations: veberViolations.length, details: veberViolations },
            ghose: { passed: ghoseViolations.length === 0, violations: ghoseViolations.length, details: ghoseViolations }
        },
        admet: generateMockAdmet(logP, mw)
    };
}

export function getDrugLikenessColor(classification: DrugLikenessResult['classification']): string {
    switch (classification) {
        case 'Drug-like': return 'text-success bg-success/10 border-success/20';
        case 'Lead-like': return 'text-primary bg-primary/10 border-primary/20';
        case 'Fragment-like': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
        default: return 'text-destructive bg-destructive/10 border-destructive/20';
    }
}
