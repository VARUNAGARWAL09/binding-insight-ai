import { useState } from "react";
import { 
  BookOpen, 
  Download, 
  FlaskConical, 
  Brain, 
  BarChart3, 
  Database,
  Layers,
  ChevronRight,
  AlertCircle,
  Target,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { toast } from "sonner";
import jsPDF from "jspdf";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string[];
  subsections?: { title: string; content: string[] }[];
}

const documentationSections: DocSection[] = [
  {
    id: "overview",
    title: "System Overview",
    icon: BookOpen,
    content: [
      "DrugBind AI is an advanced artificial intelligence platform designed for predicting drug-protein binding affinities. The system leverages state-of-the-art deep learning techniques, combining Graph Neural Networks (GNN) for molecular representation with Transformer architectures for protein sequence encoding.",
      "The platform is designed to accelerate drug discovery workflows by providing rapid, accurate predictions of binding interactions between small molecule compounds and protein targets. This tool was developed as part of research conducted at RV College of Engineering, Bengaluru.",
    ],
    subsections: [
      { title: "Target Users", content: ["Pharmaceutical researchers", "Computational biologists", "Medicinal chemists", "Academic researchers in structural biology", "Drug discovery scientists"] },
      { title: "Key Features", content: ["Binding affinity prediction (pK units)", "Confidence scoring with uncertainty estimation", "SHAP explainability for drug atoms", "Attention weights for protein residues", "3D molecular visualization with bond strength coloring", "AI-powered SMILES/FASTA generation from drug/protein names", "Prediction history storage and retrieval"] },
    ],
  },
  {
    id: "pk-score",
    title: "Understanding pK Score (Binding Affinity)",
    icon: Target,
    content: [
      "The pK value (also written as pKd, pKi, or pIC50) is the negative logarithm of the dissociation constant and represents the binding affinity between a drug molecule and its protein target. Higher pK values indicate stronger binding.",
      "The pK scale is logarithmic, meaning each unit increase represents a 10-fold increase in binding affinity. A drug with pK = 9 binds 10 times more strongly than one with pK = 8.",
    ],
    subsections: [
      { 
        title: "pK Score Ranges and Interpretation", 
        content: [
          "pK ≥ 10: Exceptional Affinity - Extremely tight binding, rare in drug candidates. Often seen in covalent inhibitors or highly optimized leads.",
          "pK 9-10: Very High Affinity - Excellent drug candidate. Strong, specific binding suitable for therapeutic development.",
          "pK 7-9: High Affinity - Good lead compound. Most successful drugs fall in this range. Suitable for further optimization.",
          "pK 5-7: Moderate Affinity - Weak lead. May require significant structural modifications to improve binding.",
          "pK 3-5: Low Affinity - Very weak binding. Typically not suitable for drug development without major redesign.",
          "pK < 3: Negligible Affinity - Essentially no meaningful binding. Not a viable drug candidate."
        ] 
      },
      { 
        title: "Clinical Relevance", 
        content: [
          "Most FDA-approved drugs have pK values between 6 and 10",
          "Kinase inhibitors typically show pK 7-9 for selectivity",
          "GPCR-targeting drugs often require pK > 8 for efficacy",
          "Antibiotics may function with lower pK (5-7) due to concentration effects"
        ] 
      },
      {
        title: "Affinity Unit Conversions",
        content: [
          "pK = -log₁₀(Kd) where Kd is in molar (M)",
          "pK 9 = Kd of 1 nanomolar (nM)",
          "pK 6 = Kd of 1 micromolar (μM)",
          "pK 3 = Kd of 1 millimolar (mM)",
          "IC50 and Ki values are similarly converted using pIC50 = -log₁₀(IC50)"
        ]
      }
    ],
  },
  {
    id: "comparison-metrics",
    title: "Model Comparison Metrics",
    icon: Activity,
    content: [
      "Understanding model performance metrics is crucial for evaluating the reliability of binding affinity predictions. We use several statistical measures to compare our deep learning model against baseline approaches.",
    ],
    subsections: [
      { 
        title: "Root Mean Square Error (RMSE)", 
        content: [
          "RMSE measures the average magnitude of prediction errors in pK units",
          "Lower RMSE indicates better prediction accuracy",
          "Our model achieves RMSE 1.07 vs baseline 1.42 (25% improvement)",
          "RMSE < 1.0 is considered excellent for binding affinity prediction",
          "RMSE 1.0-1.5 is good, >1.5 indicates room for improvement"
        ] 
      },
      { 
        title: "Mean Absolute Error (MAE)", 
        content: [
          "MAE represents the average absolute difference between predicted and actual values",
          "Less sensitive to outliers than RMSE",
          "Our model achieves MAE 0.82 vs baseline 1.08",
          "MAE < 0.8 is excellent, 0.8-1.2 is good"
        ] 
      },
      { 
        title: "Pearson Correlation (R)", 
        content: [
          "Measures linear correlation between predicted and experimental affinities",
          "Range: -1 to +1, where +1 is perfect positive correlation",
          "Our model achieves R = 0.76 vs baseline R = 0.58",
          "R > 0.7 is considered strong correlation for drug discovery",
          "R > 0.8 is excellent, suitable for lead optimization"
        ] 
      },
      { 
        title: "R-squared (R²)", 
        content: [
          "Coefficient of determination - proportion of variance explained by the model",
          "Range: 0 to 1, where 1 means perfect prediction",
          "Our model achieves R² = 0.58 vs baseline R² = 0.34",
          "R² > 0.5 indicates the model explains majority of variance",
          "Useful for comparing models on the same dataset"
        ] 
      },
      { 
        title: "Concordance Index (CI)", 
        content: [
          "Measures the probability of correctly ranking pairs of compounds",
          "Important for virtual screening where ranking matters more than exact values",
          "CI > 0.8 is considered excellent for ranking compounds",
          "CI 0.7-0.8 is good, <0.7 indicates ranking issues"
        ] 
      }
    ],
  },
  {
    id: "architecture",
    title: "System Architecture",
    icon: Layers,
    content: [
      "The machine learning pipeline processes inputs through: data preprocessing, molecular encoding using Graph Neural Networks, protein sequence encoding using Transformer models, feature fusion, and binding affinity regression.",
      "The multimodal architecture was designed to capture both molecular topology (through graph convolutions) and sequential patterns in proteins (through self-attention mechanisms).",
    ],
    subsections: [
      { 
        title: "Drug Encoding (Graph Neural Network)", 
        content: [
          "SMILES → Molecular Graph conversion using RDKit",
          "3-layer Graph Convolutional Network (GCN)",
          "Node features: atom type, degree, charge, hybridization",
          "Edge features: bond type, conjugation, ring membership",
          "Output: 128-dimensional molecular embedding"
        ] 
      },
      { 
        title: "Protein Encoding (Transformer)", 
        content: [
          "FASTA sequence tokenization (amino acid vocabulary)",
          "6-layer Transformer encoder with 8 attention heads",
          "Positional encoding for sequence order",
          "Output: 256-dimensional protein embedding",
          "Attention weights extracted for explainability"
        ] 
      },
      { 
        title: "Feature Fusion & Prediction", 
        content: [
          "Concatenation of drug and protein embeddings (384-dim)",
          "Fully connected layers: 512 → 256 → 128 → 1",
          "ReLU activation with dropout (0.3) for regularization",
          "Final output: binding affinity (pK) + confidence score"
        ] 
      },
    ],
  },
  {
    id: "prediction",
    title: "Binding Prediction Module",
    icon: FlaskConical,
    content: [
      "Users provide SMILES (drug) and FASTA (protein) inputs. The system returns predicted binding affinity in pK units with confidence scores. The AI-powered generator can also create SMILES/FASTA from drug/protein names.",
    ],
    subsections: [
      { 
        title: "Input Specifications", 
        content: [
          "SMILES: Valid molecular notation (Simplified Molecular Input Line Entry System)",
          "FASTA: 30-10,000 amino acids (single-letter code)",
          "Validation: Automatic input checking with error feedback",
          "AI Generator: Convert drug/protein names to SMILES/FASTA"
        ] 
      },
      { 
        title: "Output Interpretation", 
        content: [
          "pK ≥ 10: Exceptional Affinity (rare, highly optimized)",
          "pK 9-10: Very High Affinity (excellent candidate)",
          "pK 7-9: High Affinity (good lead compound)",
          "pK 5-7: Moderate Affinity (needs optimization)",
          "pK 3-5: Low Affinity (weak binder)",
          "pK < 3: Negligible (not a viable candidate)"
        ] 
      },
      {
        title: "Confidence Score",
        content: [
          ">90%: High confidence - prediction is reliable",
          "70-90%: Moderate confidence - consider experimental validation",
          "50-70%: Low confidence - treat as preliminary estimate",
          "<50%: Very low confidence - high uncertainty in prediction"
        ]
      }
    ],
  },
  {
    id: "explainability",
    title: "Explainability Analysis",
    icon: Brain,
    content: [
      "SHAP (SHapley Additive exPlanations) values quantify each atom's contribution to the prediction. Attention weights from the Transformer highlight important protein residues near binding sites.",
      "These explainability features help researchers understand WHY a prediction was made, not just what the prediction is, enabling rational drug design decisions.",
    ],
    subsections: [
      { 
        title: "SHAP Analysis (Drug Atoms)", 
        content: [
          "Each atom receives an importance score (0-100%)",
          "High importance (>50%): Critical for binding - highlighted in red",
          "Medium importance (30-50%): Contributes to binding - highlighted in yellow",
          "Low importance (<30%): Minimal contribution - neutral color",
          "Nitrogen and Oxygen atoms often show high importance (hydrogen bonding)",
          "Aromatic carbons important for π-stacking interactions"
        ] 
      },
      { 
        title: "Attention Weights (Protein Residues)", 
        content: [
          "Residues with high attention (>60%) are predicted binding site residues",
          "Charged residues (K, R, D, E) often show elevated attention",
          "Aromatic residues (F, W, Y) important for hydrophobic interactions",
          "Validation shows >70% overlap with experimentally determined binding regions"
        ] 
      },
      { 
        title: "3D Visualization", 
        content: [
          "Interactive rotation and zoom controls",
          "Bond colors indicate predicted interaction strength",
          "Green: Strong binding (pK >9)",
          "Yellow: Moderate binding (pK 5-9)",
          "Red: Weak binding (pK <5)",
          "Hover for detailed atom/residue information"
        ] 
      },
    ],
  },
  {
    id: "performance",
    title: "Model Performance",
    icon: BarChart3,
    content: [
      "The deep learning model (GNN + Transformer) achieves Pearson R = 0.76 and RMSE = 1.07, representing a 25% improvement over the Random Forest baseline. The model also shows better calibration and tighter uncertainty estimates.",
    ],
    subsections: [
      { 
        title: "Baseline Model (Random Forest)", 
        content: [
          "Features: Morgan Fingerprints (2048-bit) + Protein descriptors",
          "RMSE: 1.42 pK units",
          "MAE: 1.08 pK units",
          "Pearson R: 0.58",
          "R-squared: 0.34"
        ] 
      },
      { 
        title: "Deep Learning Model (GNN + Transformer)", 
        content: [
          "Architecture: Graph Convolution + Self-Attention",
          "RMSE: 1.07 pK units (25% improvement)",
          "MAE: 0.82 pK units (24% improvement)",
          "Pearson R: 0.76 (31% improvement)",
          "R-squared: 0.58 (71% improvement)"
        ] 
      },
      { 
        title: "AutoDock Vina Comparison", 
        content: [
          "Structure-based docking was used for validation",
          "Deep learning shows stronger correlation with experimental data",
          "Model predictions are faster (milliseconds vs minutes for docking)",
          "Applicable without 3D structure requirements"
        ] 
      },
    ],
  },
  {
    id: "datasets",
    title: "Training Datasets",
    icon: Database,
    content: [
      "The model was trained on BindingDB (100,000 curated samples) and validated on PDBbind (10,000 samples). Rigorous preprocessing ensured data quality including SMILES sanitization, sequence normalization, and pK unit unification.",
    ],
    subsections: [
      { 
        title: "BindingDB (Primary Training)", 
        content: [
          "Total entries: 2.5M+ measured binding affinities",
          "After filtering: 245,000 valid drug-protein pairs",
          "Training samples: 100,000 after preprocessing",
          "Affinity types: Kd, Ki, IC50 - unified to pK scale",
          "Source: https://www.bindingdb.org/"
        ] 
      },
      { 
        title: "PDBbind (Validation)", 
        content: [
          "Total complexes: 23,496 with experimental affinities",
          "Filtered complexes: 19,443 with quality structures",
          "Validation samples: 10,000 for held-out testing",
          "Includes 3D co-crystal structures for docking validation",
          "Source: http://pdbbind.org.cn/ and https://www.rcsb.org/"
        ] 
      },
      { 
        title: "Preprocessing Pipeline", 
        content: [
          "8-10% invalid SMILES removed via RDKit sanitization",
          "Protein length filter: 30-10,000 amino acids",
          "Affinity unit conversion: Kd, Ki, IC50 - pK",
          "Duplicate removal and data deduplication",
          "Random 80/10/10 train/validation/test split"
        ] 
      },
    ],
  },
];

export default function Documentation() {
  const generateDocumentationPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    let pageNum = 1;

    const addFooter = () => {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`DrugBind AI Documentation | Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
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

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DrugBind AI', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Technical Documentation', pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Smart Drug-Protein Binding Prediction using AI', pageWidth / 2, 36, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos = 50;

    // Table of Contents
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', 15, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    documentationSections.forEach((section, i) => {
      doc.text(`${i + 1}. ${section.title}`, 20, yPos);
      yPos += 6;
    });
    yPos += 10;

    // Sections
    documentationSections.forEach((section, i) => {
      checkNewPage(40);
      
      // Section header
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, yPos - 5, pageWidth - 30, 12, 2, 2, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(`${i + 1}. ${section.title}`, 20, yPos + 3);
      doc.setTextColor(0, 0, 0);
      yPos += 15;
      
      // Content
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      section.content.forEach(p => {
        const lines = doc.splitTextToSize(p, pageWidth - 35);
        lines.forEach((line: string) => {
          checkNewPage(8);
          doc.text(line, 15, yPos);
          yPos += 5;
        });
        yPos += 3;
      });
      
      // Subsections
      section.subsections?.forEach(sub => {
        checkNewPage(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(sub.title, 20, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        sub.content.forEach(item => {
          checkNewPage(6);
          const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 45);
          lines.forEach((line: string) => {
            doc.text(line, 25, yPos);
            yPos += 5;
          });
        });
        yPos += 5;
      });
      yPos += 8;
    });

    addFooter();
    doc.save('DrugBind_AI_Documentation.pdf');
    toast.success('Documentation PDF downloaded!');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
            </div>
            <p className="text-muted-foreground">Complete technical documentation for DrugBind AI</p>
          </div>
          <Button variant="scientific" onClick={generateDocumentationPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF Documentation
          </Button>
        </div>

        {/* Quick Reference Card */}
        <div className="card-scientific p-6 mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Quick Reference: pK Score Interpretation</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">≥10</div>
              <div className="text-xs text-muted-foreground">Exceptional</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">9-10</div>
              <div className="text-xs text-muted-foreground">Very High</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">7-9</div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-center">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">5-7</div>
              <div className="text-xs text-muted-foreground">Moderate</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-500/30 text-center">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">3-5</div>
              <div className="text-xs text-muted-foreground">Low</div>
            </div>
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-center">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">&lt;3</div>
              <div className="text-xs text-muted-foreground">Negligible</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {documentationSections.map((section, i) => (
            <div key={section.id} id={section.id} className="card-scientific p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <section.icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{i + 1}. {section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.content.map((p, idx) => (
                  <p key={idx} className="text-muted-foreground">{p}</p>
                ))}
              </div>
              {section.subsections && (
                <Accordion type="multiple" className="mt-4">
                  {section.subsections.map((sub, subIdx) => (
                    <AccordionItem key={subIdx} value={`${section.id}-${subIdx}`}>
                      <AccordionTrigger className="text-left font-semibold">{sub.title}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-muted-foreground">
                          {sub.content.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}