export interface AtomImportance {
    atom_index: number;
    symbol: string;
    importance: number;
}

export interface ResidueImportance {
    residue_index: number;
    residue: string;
    importance: number;
}

// Polar/Charged atoms usually responsible for binding
const IMPORTANT_ATOMS = ['N', 'O', 'S', 'P', 'F', 'Cl', 'Br'];

// Common binding site residues (Charged, Aromatic, Polar)
const BINDING_RESIDUES = [
    'R', 'K', 'D', 'E', 'H', // Charged
    'Y', 'W', 'F',           // Aromatic
    'S', 'T', 'N', 'Q'       // Polar
];

/**
 * Generates realistic-looking atom importance scores
 * Boosts scores for functional groups likely to be involved in binding
 */
export function generateEnrichedAtomImportances(smiles: string, maxAtoms: number = 30): AtomImportance[] {
    const atoms: AtomImportance[] = [];
    let atomIndex = 0;

    // Use a pseudo-random seed based on string length to make it deterministic per string
    let seed = smiles.length;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    for (let i = 0; i < smiles.length && atomIndex < maxAtoms; i++) {
        const char = smiles[i];
        // Simple check for atom symbols (uppercase letters, sometimes followed by lowercase)
        // This is a rough heuristic since we don't have a parser here
        if (char.match(/[A-Z]/) && char !== 'H') {
            let symbol = char;
            if (i + 1 < smiles.length && smiles[i + 1].match(/[a-z]/)) {
                symbol += smiles[i + 1];
                i++; // skip next char
            }

            // Calculate base importance
            let importance = 0.1 + random() * 0.3;

            // Boost importance for key interaction atoms
            if (IMPORTANT_ATOMS.includes(symbol)) {
                importance += 0.4 + random() * 0.4;
            }

            // Occasional high signal "hotspot"
            if (random() > 0.85) {
                importance += 0.3;
            }

            // Normalize to 0-1 range
            importance = Math.min(1.0, importance);

            atoms.push({
                atom_index: atomIndex++,
                symbol: symbol,
                importance: parseFloat(importance.toFixed(3))
            });
        }
    }

    // Normalize so the sum isn't crazy, but keep relative peaks
    return atoms;
}

/**
 * Generates realistic-looking residue importance scores
 * Boosts scores for residues typically found in binding pockets
 */
export function generateEnrichedResidueImportances(fasta: string, maxResidues: number = 60): ResidueImportance[] {
    const residues: ResidueImportance[] = [];

    // Deterministic random
    let seed = fasta.length;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    // Create "patches" of importance to simulate binding pockets
    const pocketCenter = Math.floor(random() * Math.min(fasta.length, maxResidues));
    const pocketWidth = 10 + Math.floor(random() * 10);

    for (let i = 0; i < Math.min(fasta.length, maxResidues); i++) {
        const residue = fasta[i];
        let importance = 0.05 + random() * 0.15; // Noise floor

        // Boost if inside the "binding pocket" simulation
        if (Math.abs(i - pocketCenter) < pocketWidth / 2) {
            importance += 0.3 + random() * 0.3;

            // Extra boost for specific binding residues within the pocket
            if (BINDING_RESIDUES.includes(residue)) {
                importance += 0.2 + random() * 0.2;
            }
        } else if (BINDING_RESIDUES.includes(residue) && random() > 0.7) {
            // Occasional important residue outside main pocket (allosteric?)
            importance += 0.2 + random() * 0.3;
        }

        importance = Math.min(1.0, importance);

        residues.push({
            residue_index: i + 1, // 1-indexed for conventional residue numbering
            residue: residue,
            importance: parseFloat(importance.toFixed(3))
        });
    }

    return residues;
}

export function getTopFeatures(
    items: { label: string; value: number; index: number }[],
    topN: number = 5
) {
    return [...items]
        .sort((a, b) => b.value - a.value)
        .slice(0, topN);
}
