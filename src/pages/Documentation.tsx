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
  History,
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
      "DrugBind AI is an advanced artificial intelligence platform designed for predicting how strongly a drug molecule will bind to a specific protein target. This interaction is key to discovering new medicines.",
      "The system uses state-of-the-art deep learning, specifically combining Graph Neural Networks (which understand molecule shapes) with Transformer architectures (which understand protein sequences), to provide highly accurate predictions.",
      "This tool helps accelerate drug discovery by allowing researchers to screen millions of potential drug candidates virtually before testing them in a lab."
    ],
    subsections: [
      { title: "Target Users", content: ["Pharmaceutical researchers", "Computational biologists", "Medicinal chemists", "Academic researchers", "Drug discovery scientists"] },
      { title: "Key Features", content: ["Accurate binding affinity prediction", "Confidence scores for every prediction", "Visual explanations of which atoms contribute to binding", "3D molecular visualization", "Automatic history tracking", "Detailed PDF reports"] },
    ],
  },
  {
    id: "pk-score",
    title: "Understanding Binding Affinity (pK Score)",
    icon: Target,
    content: [
      "The primary output of the model is a 'pK value'. This is a standard measure of how tightly a drug binds to its target. Technically, it is the negative logarithm of the dissociation constant.",
      "Think of it like a Richter scale for drugs: a higher number means a stronger binding. Each step up (e.g., from 8 to 9) means the binding is 10 times stronger.",
    ],
    subsections: [
      {
        title: "How to Interpret the Score",
        content: [
          "pK >= 10 (Exceptional): Extremely tight binding. Rare and usually indicates a highly optimized drug candidate.",
          "pK 9-10 (Very High): Excellent potential. These are strong candidates for further development.",
          "pK 7-9 (High): Good potential. Most successful drugs fall into this range.",
          "pK 5-7 (Moderate): Weak binding. Might be a starting point but needs significant improvement.",
          "pK < 5 (Low): Very weak or no binding. Likely not a viable drug candidate."
        ]
      },
      {
        title: "Scientific Context",
        content: [
          "Most FDA-approved drugs have pK values between 6 and 10.",
          "A value of 9 corresponds to a concentration of 1 nanomolar (very potent).",
          "A value of 6 corresponds to 1 micromolar (moderately potent)."
        ]
      }
    ],
  },
  {
    id: "comparison-metrics",
    title: "Model Performance Metrics",
    icon: Activity,
    content: [
      "To ensure our predictions are reliable, we rigorously test the model against known experimental data. We use several standard statistical metrics to measure accuracy.",
    ],
    subsections: [
      {
        title: "Root Mean Square Error (RMSE)",
        content: [
          "This measures the average 'distance' between our predicted value and the actual laboratory value.",
          "Lower is better. A value of 0 would mean perfect accuracy.",
          "Our model achieves an RMSE of 1.07, which is considered excellent for this type of prediction."
        ]
      },
      {
        title: "Mean Absolute Error (MAE)",
        content: [
          "Similar to RMSE, this is the average absolute difference between prediction and reality.",
          "Our model achieves an MAE of 0.82, meaning predictions are typically within 0.82 units of the true value."
        ]
      },
      {
        title: "Pearson Correlation (R)",
        content: [
          "This measures how well the model captures trends. If the actual affinity goes up, does the prediction also go up?",
          "Range is -1 to +1.  +1 is a perfect match.",
          "Our model achieves 0.76, indicating a strong positive correlation."
        ]
      },
      {
        title: "R-squared (R²)",
        content: [
          "This tells us what percentage of the data's variation our model can explain.",
          "A value of 100% (or 1.0) would mean it explains everything.",
          "Our model achieves 0.58, which is significantly better than the baseline of 0.34."
        ]
      }
    ],
  },
  {
    id: "architecture",
    title: "How the AI Works",
    icon: Layers,
    content: [
      "Our 'Brain' consists of two main parts that work together: one part looks at the drug, and the other looks at the protein.",
    ],
    subsections: [
      {
        title: "1. The Drug Reader (Graph Neural Network - GNN)",
        content: [
          "We treat drug molecules like graphs (nodes are atoms, edges are bonds).",
          "This allows the AI to understand the 3D shape and chemical properties of the drug.",
          "It captures features like charge, atom type, and connectivity."
        ]
      },
      {
        title: "2. The Protein Reader (Transformer)",
        content: [
          "We treat proteins like language sequences (strings of amino acids).",
          "Using technology similar to ChatGPT (Transformers), the model learns the 'grammar' of protein folding and interaction sites.",
          "It pays attention to specific parts of the sequence that are likely to interact with the drug."
        ]
      },
      {
        title: "3. The Decision Maker (Fusion Layer)",
        content: [
          "The system combines the understanding from both readers.",
          "It processes this combined information to output a final binding affinity score.",
          "It also estimates how confident it is in that prediction."
        ]
      },
    ],
  },
  {
    id: "prediction",
    title: "Using the Prediction Module",
    icon: FlaskConical,
    content: [
      "The main feature of the app. You simply input the drug structure and protein sequence, and the AI does the rest.",
    ],
    subsections: [
      {
        title: "Input Formats",
        content: [
          "Drug Input: Requires 'SMILES' format (e.g., CC(=O)OC...). This is a standard way to write molecules as text.",
          "Protein Input: Requires 'FASTA' format (sequence of letters representing amino acids).",
          "Don't worry if you don't know them—our AI Assistant can generate them for you from common names!"
        ]
      },
      {
        title: "Confidence Scores",
        content: [
          "High Confidence (>90%): The model has seen similar examples and is very sure.",
          "Medium Confidence (70-90%): Reliable for screening.",
          "Low Confidence (<70%): Treat as a rough estimate. Experimental verification is recommended."
        ]
      }
    ],
  },
  {
    id: "history",
    title: "Prediction History & Analytics",
    icon: History,
    content: [
      "Keep track of all your experiments. The History dashboard provides a comprehensive view of your past predictions, allowing you to monitor trends and manage your research data.",
    ],
    subsections: [
      {
        title: "Timeline View",
        content: [
          "Automatically saves every prediction (both single and batch).",
          "Groups predictions by date (Today, Yesterday, Last Week).",
          "Color-coded cards show pK values and confidence scores at a glance."
        ]
      },
      {
        title: "Analytics Dashboard",
        content: [
          "Visualizes your research progress over time.",
          "pK Trend Chart: See how your candidate affinity is improving.",
          "Source Distribution: Track single vs. batch processing volume.",
          "Key Metrics: View total predictions and average confidence."
        ]
      },
      {
        title: "Data Management",
        content: [
          "Search: Instantly find past predictions by drug or protein name.",
          "Favorites: Star important results for quick access.",
          "Notes: Add personal annotations to any prediction.",
          "Export: Download your entire history as a JSON file for backup."
        ]
      }
    ]
  },
  {
    id: "drug-likeness",
    title: "Drug Likeness Calculator",
    icon: FlaskConical,
    content: [
      "Before synthesis, it's crucial to know if a molecule has 'drug-like' properties. This module evaluates your candidate against established medicinal chemistry rules.",
    ],
    subsections: [
      {
        title: "Lipinski's Rule of Five",
        content: [
          "The gold standard for oral drug candidates.",
          "Checks Molecular Weight (<500 Da), LogP (<5), Hydrogen Bond Donors (<5), and Acceptors (<10).",
          "Helps predict if a drug can be absorbed by the human body."
        ]
      },
      {
        title: "Advanced Filters",
        content: [
          "Ghose Filter: Checks drug-likeness based on property ranges of known drugs (MW, LogP, MR, Atom count).",
          "Veber's Rules: Evaluates oral bioavailability based on flexibility (Rotatable Bonds) and Polar Surface Area (TPSA)."
        ]
      },
      {
        title: "Visualization & Reports",
        content: [
          "Radar Chart: Visually compare 6 key molecular properties against ideal ranges.",
          "QED Score: A single 'Quantitative Estimate of Drug-likeness' score (0-1).",
          "ADMET Prediction: Estimates Absorption, Toxicity, and other pharmacokinetic properties.",
          "PDF Report: Download a detailed analysis certification for your compound."
        ]
      }
    ]
  },
  {
    id: "explainability",
    title: "Explainability (Why did it predict this?)",
    icon: Brain,
    content: [
      "AI shouldn't be a black box. We provide tools to see exactly why the model made a specific prediction.",
    ],
    subsections: [
      {
        title: "Atom Importance (SHAP)",
        content: [
          "We highlight correct atoms in the drug molecule that contributed most to the prediction.",
          "Red/Hot colors mean that part of the molecule is driving the strong binding.",
          "This helps chemists optimize the drug by keeping the 'good' parts and modifying the rest."
        ]
      },
      {
        title: "Protein Attention",
        content: [
          "The model highlights specific amino acids in the protein chain.",
          "These often correspond to the actual binding pocket where the drug attaches.",
          "This confirms the model is looking at the biologically relevant areas."
        ]
      }
    ],
  },
  {
    id: "datasets",
    title: "Training Data",
    icon: Database,
    content: [
      "Just like a student needs textbooks, our AI needs data to learn. We used the highest quality scientific datasets available.",
      "The primary training source was BindingDB, a public database of measured binding affinities.",
      "We strictly separated our data into Training (to teach), Validation (to tune), and Testing (to evaluate) sets to ensure honest performance metrics."
    ],
    subsections: [
      {
        title: "BindingDB",
        content: [
          "Contains over 100,000 carefully curated drug-protein pairs.",
          "Includes real experimental results from wet-lab experiments."
        ]
      },
      {
        title: "PDBbind",
        content: [
          "A high-quality dataset used specifically for validating our results.",
          "Contains 3D structures of complexes, allowing us to benchmark against geometry-based methods."
        ]
      }
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