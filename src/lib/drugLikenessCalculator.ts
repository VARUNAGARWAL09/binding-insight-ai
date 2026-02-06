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
 * Estimate molecular weight from SMILES string
 */
function estimateMolecularWeight(smiles: string): number {
    const atomicWeights: Record<string, number> = {
        'C': 12.01, 'N': 14.01, 'O': 16.00, 'S': 32.07, 'P': 30.97,
        'F': 19.00, 'Cl': 35.45, 'Br': 79.90, 'I': 126.90, 'H': 1.008,
    };

    let weight = 0;
    const matches = smiles.match(/Br|Cl|[CNOSPFIH]|\d+/g) || [];

    for (const token of matches) {
        if (atomicWeights[token]) weight += atomicWeights[token];
    }
    return Math.round(weight * 100) / 100;
}

function countHDonors(smiles: string): number {
    return (smiles.match(/[NH][H]?|OH/g) || []).length;
}

function countHAcceptors(smiles: string): number {
    return (smiles.match(/[NO]/g) || []).length;
}

function estimateLogP(smiles: string): number {
    const c = (smiles.match(/C/g) || []).length;
    const n = (smiles.match(/N/g) || []).length;
    const o = (smiles.match(/O/g) || []).length;
    const s = (smiles.match(/S/g) || []).length;
    const hal = (smiles.match(/[FClBrI]/g) || []).length;

    // Simplified Wildman-Crippen
    const logP = (c * 0.35) + (n * -0.30) + (o * -0.45) + (s * 0.60) + (hal * 0.20);
    return Math.round(logP * 100) / 100;
}

function countRotatableBonds(smiles: string): number {
    const singleBonds = (smiles.match(/-/g) || []).length;
    return Math.floor(singleBonds * 0.6) + (smiles.length > 20 ? 2 : 0); // Tweaked approximation
}

function estimatePolarSurfaceArea(smiles: string): number {
    const o = (smiles.match(/O/g) || []).length;
    const n = (smiles.match(/N/g) || []).length;
    const psa = (o * 20) + (n * 23.8);
    return Math.round(psa * 100) / 100;
}

function estimateMolarRefractivity(mw: number, logP: number): number {
    // Rough empirical correlation
    return Math.round((0.3 * mw + 5 * logP) * 100) / 100;
}

function countAtoms(smiles: string): number {
    return (smiles.match(/Br|Cl|[CNOSPFIH]/g) || []).length;
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
    const lipinskiViolations: string[] = [];
    if (mw > 500) lipinskiViolations.push(`MW > 500 (${mw})`);
    if (logP > 5) lipinskiViolations.push(`LogP > 5 (${logP})`);
    if (hDonors > 5) lipinskiViolations.push(`Donors > 5 (${hDonors})`);
    if (hAcceptors > 10) lipinskiViolations.push(`Acceptors > 10 (${hAcceptors})`);

    const veberViolations: string[] = [];
    if (rotatableBonds > 10) veberViolations.push(`Rotatable > 10 (${rotatableBonds})`);
    if (psa > 140) veberViolations.push(`PSA > 140 (${psa})`);

    const ghoseViolations: string[] = [];
    if (mw < 160 || mw > 480) ghoseViolations.push(`MW outside 160-480 (${mw})`);
    if (logP < -0.4 || logP > 5.6) ghoseViolations.push(`LogP outside -0.4-5.6 (${logP})`);
    if (mr < 40 || mr > 130) ghoseViolations.push(`MR outside 40-130 (${mr})`);
    if (atomCount < 20 || atomCount > 70) ghoseViolations.push(`Atoms outside 20-70 (${atomCount})`);

    const allViolations = [...lipinskiViolations, ...veberViolations, ...ghoseViolations];

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
