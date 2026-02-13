// Glossary of scientific terms with definitions
export interface GlossaryTerm {
    term: string;
    definition: string;
    category: 'binding' | 'chemistry' | 'protein' | 'analysis' | 'general';
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
    // Binding Terms
    'pk': {
        term: 'pK',
        definition: 'Negative logarithm of the dissociation constant (Kd). Higher pK values indicate stronger binding affinity between a drug and its target protein.',
        category: 'binding',
    },
    'binding affinity': {
        term: 'Binding Affinity',
        definition: 'The strength of the interaction between a drug molecule and its target protein. Measured as dissociation constant (Kd) or as pK value.',
        category: 'binding',
    },
    'kd': {
        term: 'Kd (Dissociation Constant)',
        definition: 'The equilibrium dissociation constant, representing the concentration at which half of the binding sites are occupied. Lower Kd indicates stronger binding.',
        category: 'binding',
    },
    'ki': {
        term: 'Ki (Inhibition Constant)',
        definition: 'A measure of how effectively a compound inhibits enzyme activity. Similar to Kd but specific to inhibition.',
        category: 'binding',
    },
    'ic50': {
        term: 'IC50',
        definition: 'The concentration of an inhibitor needed to reduce enzyme activity by 50%. Commonly used metric in drug discovery.',
        category: 'binding',
    },

    // Chemistry Terms  
    'smiles': {
        term: 'SMILES',
        definition: 'Simplified Molecular Input Line Entry System - a text notation for representing chemical structures.',
        category: 'chemistry',
    },
    'logp': {
        term: 'LogP',
        definition: 'Logarithm of the partition coefficient between octanol and water. Indicates a molecule\'s lipophilicity (fat solubility). Typical range for drugs: 0-5.',
        category: 'chemistry',
    },
    'molecular weight': {
        term: 'Molecular Weight (MW)',
        definition: 'The sum of atomic weights of all atoms in a molecule, measured in Daltons (Da). Rule of Five suggests drugs should be ≤500 Da.',
        category: 'chemistry',
    },
    'hydrogen bond': {
        term: 'Hydrogen Bond',
        definition: 'A weak electrostatic attraction between a hydrogen atom and an electronegative atom. Critical for drug-protein interactions.',
        category: 'chemistry',
    },
    'polar surface area': {
        term: 'Polar Surface Area (PSA)',
        definition: 'Surface area of polar atoms in a molecule. Indicates ability to cross cell membranes. Drugs typically have PSA < 140 Ų.',
        category: 'chemistry',
    },
    'rotatable bonds': {
        term: 'Rotatable Bonds',
        definition: 'Single bonds (not in a ring) that allow free rotation. Fewer rotatable bonds generally mean better oral bioavailability.',
        category: 'chemistry',
    },

    // Protein Terms
    'fasta': {
        term: 'FASTA',
        definition: 'A text format for representing protein or nucleotide sequences using single-letter codes.',
        category: 'protein',
    },
    'protein target': {
        term: 'Protein Target',
        definition: 'A specific protein that a drug is designed to bind to and modulate, often an enzyme, receptor, or ion channel.',
        category: 'protein',
    },
    'kinase': {
        term: 'Kinase',
        definition: 'An enzyme that catalyzes phosphorylation reactions. Common drug targets in cancer and inflammation.',
        category: 'protein',
    },
    'gpcr': {
        term: 'GPCR',
        definition: 'G Protein-Coupled Receptor - a large family of cell surface receptors. Target for ~34% of all FDA-approved drugs.',
        category: 'protein',
    },
    'protease': {
        term: 'Protease',
        definition: 'An enzyme that breaks down proteins by hydrolysis of peptide bonds. Important targets for antiviral and cancer drugs.',
        category: 'protein',
    },

    // Analysis Terms
    'confidence score': {
        term: 'Confidence Score',
        definition: 'A measure of the model\'s certainty in its prediction, ranging from 0 to 1 (or 0% to 100%).',
        category: 'analysis',
    },
    'confidence interval': {
        term: 'Confidence Interval',
        definition: 'A range of values that likely contains the true value. For example, 95% CI means we\'re 95% confident the true value falls within this range.',
        category: 'analysis',
    },
    'explainability': {
        term: 'Explainability',
        definition: 'The ability to understand and interpret why a machine learning model made a particular prediction.',
        category: 'analysis',
    },

    // Drug-Likeness Terms
    'lipinski': {
        term: 'Lipinski\'s Rule of Five',
        definition: 'Guidelines for drug-likeness: MW ≤ 500, LogP ≤ 5, H-bond donors ≤ 5, H-bond acceptors ≤ 10. Predicts oral bioavailability.',
        category: 'chemistry',
    },
    'drug-like': {
        term: 'Drug-like',
        definition: 'A compound that has physical and chemical properties consistent with known oral drugs, typically following Lipinski\'s Rule of Five.',
        category: 'chemistry',
    },
    'lead-like': {
        term: 'Lead-like',
        definition: 'A smaller molecule (MW < 450) with good optimization potential. May have 1 Lipinski violation but suitable for further development.',
        category: 'chemistry',
    },
    'bioavailability': {
        term: 'Bioavailability',
        definition: 'The fraction of an administered drug that reaches systemic circulation unchanged. Oral bioavailability is especially important for pills.',
        category: 'general',
    },
};

// Helper function to get term definition
export function getDefinition(term: string): GlossaryTerm | undefined {
    const key = term.toLowerCase();
    return GLOSSARY[key];
}

// Get all terms by category
export function getTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
    return Object.values(GLOSSARY).filter(item => item.category === category);
}
