import jsPDF from 'jspdf';
import { PredictionResponse, ExplainabilityResponse } from './api';

// Full atom names mapping
const atomFullNames: Record<string, string> = {
  C: 'Carbon',
  N: 'Nitrogen',
  O: 'Oxygen',
  S: 'Sulfur',
  P: 'Phosphorus',
  F: 'Fluorine',
  Cl: 'Chlorine',
  Br: 'Bromine',
  I: 'Iodine',
  H: 'Hydrogen',
};

// Amino acid full names
const aaFullNames: Record<string, string> = {
  A: 'Alanine', R: 'Arginine', N: 'Asparagine', D: 'Aspartic Acid',
  C: 'Cysteine', E: 'Glutamic Acid', Q: 'Glutamine', G: 'Glycine',
  H: 'Histidine', I: 'Isoleucine', L: 'Leucine', K: 'Lysine',
  M: 'Methionine', F: 'Phenylalanine', P: 'Proline', S: 'Serine',
  T: 'Threonine', W: 'Tryptophan', Y: 'Tyrosine', V: 'Valine',
};

interface ReportData {
  smiles: string;
  fasta: string;
  result: PredictionResponse;
  explainData?: ExplainabilityResponse;
}

export function generatePredictionPDF(data: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 20;
  let pageNum = 1;

  const addHeader = () => {
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DrugBind AI', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Drug-Protein Binding Prediction Report', pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Report ID: ${data.result.prediction_id}`, pageWidth / 2, 38, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos = 55;
  };

  const addFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`DrugBind AI - Smart Drug-Protein Binding Prediction | Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  const checkNewPage = (requiredSpace: number = 30) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      addFooter();
      doc.addPage();
      pageNum++;
      yPos = 20;
      return true;
    }
    return false;
  };

  const addSectionHeader = (title: string) => {
    checkNewPage(30);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos - 5, contentWidth, 12, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(title, margin + 5, yPos + 3);
    doc.setTextColor(0, 0, 0);
    yPos += 15;
  };

  const addText = (text: string, indent: number = 0, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      checkNewPage(8);
      doc.text(line, margin + indent, yPos);
      yPos += fontSize * 0.5;
    }
    yPos += 2;
  };

  // Generate PDF
  addHeader();

  // Executive Summary
  addSectionHeader('Executive Summary');
  addText(`This report presents the binding affinity prediction results for the provided drug molecule (SMILES) and protein target (FASTA sequence). The prediction was generated using DrugBind AI's deep learning pipeline, which combines Graph Neural Networks (GNN) for molecular representation with Transformer architectures for protein sequence encoding.`);
  yPos += 5;

  // Prediction Results
  addSectionHeader('Prediction Results');
  
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(margin, yPos, 85, 35, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Predicted Binding Affinity', margin + 42.5, yPos + 10, { align: 'center' });
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text(`${data.result.binding_affinity_pk.toFixed(2)} pK`, margin + 42.5, yPos + 25, { align: 'center' });

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin + 95, yPos, 85, 35, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Confidence Score', margin + 137.5, yPos + 10, { align: 'center' });
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`${(data.result.confidence_score * 100).toFixed(1)}%`, margin + 137.5, yPos + 25, { align: 'center' });
  
  yPos += 45;

  // Affinity Interpretation
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretation:', margin, yPos);
  yPos += 7;
  
  const pk = data.result.binding_affinity_pk;
  let interpretation = '';
  if (pk >= 9) {
    interpretation = 'VERY HIGH AFFINITY - This drug-protein pair shows excellent binding potential with pK ≥ 9.0. The compound demonstrates strong molecular interactions and is highly recommended for further experimental validation and optimization studies.';
  } else if (pk >= 7) {
    interpretation = 'HIGH AFFINITY - This drug-protein pair shows good binding potential with pK between 7.0 and 9.0. The compound is a promising lead candidate that warrants further investigation through biochemical assays and structural studies.';
  } else if (pk >= 5) {
    interpretation = 'MODERATE AFFINITY - This drug-protein pair shows moderate binding potential with pK between 5.0 and 7.0. The compound may benefit from structural modifications to enhance binding characteristics before proceeding to experimental validation.';
  } else {
    interpretation = 'LOW AFFINITY - This drug-protein pair shows weak binding potential with pK < 5.0. Significant structural modifications are recommended to improve binding affinity. Consider alternative scaffolds or functional group optimization.';
  }
  addText(interpretation, 5);
  yPos += 5;

  // Drug Molecule Section
  addSectionHeader('Drug Molecule Analysis');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SMILES Notation:', margin, yPos);
  yPos += 7;
  
  doc.setFillColor(248, 250, 252);
  const smilesLines = doc.splitTextToSize(data.smiles, contentWidth - 10);
  const smilesBoxHeight = Math.min(smilesLines.length * 5 + 10, 30);
  doc.roundedRect(margin, yPos - 3, contentWidth, smilesBoxHeight, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.text(smilesLines, margin + 5, yPos + 4);
  yPos += smilesBoxHeight + 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addText('The SMILES (Simplified Molecular Input Line Entry System) notation represents the molecular structure of the drug compound. This notation encodes atoms, bonds, stereochemistry, and ring structures in a linear text format that can be processed by the GNN encoder.', 0);
  yPos += 5;

  // Protein Target Section
  addSectionHeader('Protein Target Analysis');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FASTA Sequence:', margin, yPos);
  yPos += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Sequence Length: ${data.fasta.length} amino acids`, margin, yPos);
  yPos += 7;
  
  doc.setFillColor(248, 250, 252);
  const fastaPreview = data.fasta.slice(0, 150) + (data.fasta.length > 150 ? '...' : '');
  const fastaLines = doc.splitTextToSize(fastaPreview, contentWidth - 10);
  const fastaBoxHeight = Math.min(fastaLines.length * 5 + 10, 40);
  doc.roundedRect(margin, yPos - 3, contentWidth, fastaBoxHeight, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(fastaLines.slice(0, 6), margin + 5, yPos + 4);
  yPos += fastaBoxHeight + 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addText('The FASTA sequence represents the amino acid sequence of the target protein. The Transformer encoder processes this sequence to generate protein embeddings that capture structural and functional features relevant to drug binding.', 0);
  yPos += 5;

  // Explainability Section (if available)
  if (data.explainData) {
    checkNewPage(80);
    addSectionHeader('Explainability Analysis');
    
    addText('The following analysis identifies key molecular features contributing to the binding prediction. SHAP (SHapley Additive exPlanations) values quantify atom contributions, while attention weights highlight important protein residues.', 0);
    yPos += 5;

    // Key Atoms
    const keyAtoms = data.explainData.atom_importances
      .filter(a => a.importance > 0.3)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8);

    if (keyAtoms.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Drug Atoms (SHAP Analysis):', margin, yPos);
      yPos += 8;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos - 4, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Position', margin + 5, yPos);
      doc.text('Atom Symbol', margin + 35, yPos);
      doc.text('Full Name', margin + 70, yPos);
      doc.text('Importance Score', margin + 120, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      keyAtoms.forEach((atom, i) => {
        checkNewPage(8);
        const fullName = atomFullNames[atom.symbol] || atom.symbol;
        const importance = (atom.importance * 100).toFixed(1) + '%';
        
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, yPos - 4, contentWidth, 7, 'F');
        }
        
        doc.text(`${atom.atom_index + 1}`, margin + 5, yPos);
        doc.text(atom.symbol, margin + 35, yPos);
        doc.text(fullName, margin + 70, yPos);
        
        // Color-code importance
        if (atom.importance > 0.7) {
          doc.setTextColor(220, 38, 38);
        } else if (atom.importance > 0.5) {
          doc.setTextColor(234, 179, 8);
        } else {
          doc.setTextColor(59, 130, 246);
        }
        doc.text(importance, margin + 120, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += 7;
      });
      yPos += 5;
      
      addText('Atoms with high SHAP values (>50%) are critical for binding prediction. These typically include nitrogen and oxygen atoms involved in hydrogen bonding, sulfur atoms in thioether linkages, and aromatic carbons participating in π-stacking interactions.', 0);
    }

    yPos += 5;
    checkNewPage(60);

    // Key Residues
    const keyResidues = data.explainData.residue_importances
      .filter(r => r.importance > 0.4)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8);

    if (keyResidues.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Protein Residues (Attention Analysis):', margin, yPos);
      yPos += 8;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos - 4, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Position', margin + 5, yPos);
      doc.text('Residue Code', margin + 35, yPos);
      doc.text('Full Name', margin + 70, yPos);
      doc.text('Attention Weight', margin + 120, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      keyResidues.forEach((residue, i) => {
        checkNewPage(8);
        const fullName = aaFullNames[residue.residue] || residue.residue;
        const attention = (residue.importance * 100).toFixed(1) + '%';
        
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, yPos - 4, contentWidth, 7, 'F');
        }
        
        doc.text(`${residue.residue_index + 1}`, margin + 5, yPos);
        doc.text(residue.residue, margin + 35, yPos);
        doc.text(fullName, margin + 70, yPos);
        
        if (residue.importance > 0.7) {
          doc.setTextColor(220, 38, 38);
        } else if (residue.importance > 0.5) {
          doc.setTextColor(234, 179, 8);
        } else {
          doc.setTextColor(59, 130, 246);
        }
        doc.text(attention, margin + 120, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += 7;
      });
      yPos += 5;
      
      addText('Residues with high attention weights (>60%) are predicted to be in or near the binding site. Validation studies show >70% overlap with experimentally determined binding regions. These residues are critical for drug-target interaction.', 0);
    }
  }

  // Methodology Section
  checkNewPage(60);
  addSectionHeader('Methodology');
  
  addText('This prediction was generated using the DrugBind AI deep learning pipeline, which consists of the following components:', 0);
  yPos += 3;
  
  const methodologySteps = [
    '1. Drug Encoding: The SMILES string is converted to a molecular graph representation and processed by a 3-layer Graph Convolutional Network (GCN) to generate a 128-dimensional molecular embedding.',
    '2. Protein Encoding: The FASTA sequence is tokenized and processed by a 6-layer Transformer encoder with 8 attention heads to generate a 256-dimensional protein embedding.',
    '3. Feature Fusion: Drug and protein embeddings are concatenated and passed through fully-connected layers (512 to 256 to 1) with ReLU activation and dropout regularization.',
    '4. Prediction: The final regression layer outputs the binding affinity in pK units, with a confidence score derived from model uncertainty estimation.',
    '5. Explainability: SHAP values are computed for drug atoms, and attention weights are extracted from the Transformer encoder for protein residues.',
  ];
  
  methodologySteps.forEach(step => {
    addText(step, 5);
    yPos += 2;
  });

  // Disclaimer
  checkNewPage(40);
  addSectionHeader('Disclaimer');
  
  addText('This computational prediction is provided for research purposes only. The results should be validated through experimental methods before any clinical or pharmaceutical application. The model performance was validated on BindingDB and PDBbind datasets with Pearson correlation of 0.76 and RMSE of 1.07 pK units.', 0);
  yPos += 5;
  addText('For questions or support, please contact the DrugBind AI development team.', 0);

  addFooter();
  doc.save(`DrugBind_Report_${data.result.prediction_id}.pdf`);
}

export function generateExplainabilityPDF(
  explainData: ExplainabilityResponse,
  smiles: string,
  fasta: string,
  bindingAffinity: number,
  confidence: number
): void {
  const reportData: ReportData = {
    smiles,
    fasta,
    result: {
      binding_affinity_pk: bindingAffinity,
      confidence_score: confidence,
      prediction_id: explainData.prediction_id,
    },
    explainData,
  };
  
  generatePredictionPDF(reportData);
}
