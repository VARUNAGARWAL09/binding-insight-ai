# Binding Insight AI - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features & Pages](#features--pages)
5. [Components](#components)
6. [Data & Models](#data--models)
7. [Configuration](#configuration)
8. [Setup & Installation](#setup--installation)
9. [Running the Project](#running-the-project)
10. [Dependencies](#dependencies)
11. [Architecture](#architecture)

---

## 🎯 Project Overview

**DrugBind AI** (Binding Insight AI) is an advanced AI-powered platform for drug discovery that predicts drug-protein binding affinities using deep learning. The platform provides:

- **Drug-Protein Binding Prediction**: Predict binding affinity (pK) between drug molecules (SMILES format) and protein targets (FASTA sequences)
- **AI Explainability**: Understand model decisions with SHAP values and attention heatmaps
- **Performance Analytics**: Compare baseline (Random Forest) vs deep learning (GNN + Transformer) models
- **Dataset Explorer**: Explore BindingDB, PDBbind, and ChEMBL datasets

### Key Metrics
- **100,000+** Training Samples
- **0.76** Pearson R Correlation
- **25%** RMSE Reduction
- **>70%** Binding Site Overlap

---

## 🛠 Technology Stack

### Core Technologies
- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui components
- **Routing**: React Router DOM 6.30.1

### UI Libraries & Components
- **Component Library**: Radix UI (Accordion, Dialog, Dropdown, Tabs, Toast, etc.)
- **Charts**: Recharts 2.15.4
- **Icons**: Lucide React 0.462.0
- **Theming**: next-themes 0.3.0 (Dark/Light mode support)
- **Notifications**: Sonner 1.7.4

### State Management & Data
- **Query Management**: TanStack React Query 5.83.0
- **Forms**: React Hook Form 7.61.1 + Zod 3.25.76 validation
- **Backend**: Supabase 2.91.1

### Development Tools
- **Linting**: ESLint 9.32.0 + TypeScript ESLint 8.38.0
- **Testing**: Vitest 3.2.4 + Testing Library
- **CSS Processing**: PostCSS 8.5.6 + Autoprefixer 10.4.21

---

## 📁 Project Structure

```
binding-insight-ai-main/
├── public/                      # Static assets
│   ├── research/
│   │   └── DrugBind_AI_Research_Paper.pdf
│   ├── favicon.ico
│   ├── favicon.png
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/                         # Source code
│   ├── components/              # React components
│   │   ├── assistant/           # Voice assistant components
│   │   ├── charts/              # Chart components (6 files)
│   │   ├── explainability/      # Explainability visualizations (2 files)
│   │   ├── layout/              # Layout components (2 files)
│   │   ├── prediction/          # Prediction interface (5 files)
│   │   ├── ui/                  # shadcn/ui components (49 files)
│   │   ├── visualization/       # Molecular visualizations (2 files)
│   │   ├── NavLink.tsx          # Navigation link component
│   │   └── ThemeToggle.tsx      # Dark/Light theme toggle
│   │
│   ├── data/                    # Data and models
│   │   └── datasetSamples.ts    # 10,000 sample dataset entries
│   │
│   ├── hooks/                   # Custom React hooks (2 files)
│   │
│   ├── integrations/            # External integrations (2 files)
│   │   └── supabase/            # Supabase configuration
│   │
│   ├── lib/                     # Utility libraries (3 files)
│   │
│   ├── pages/                   # Application pages
│   │   ├── Index.tsx            # Landing page
│   │   ├── Prediction.tsx       # Prediction interface
│   │   ├── Explainability.tsx   # AI explainability viewer
│   │   ├── Performance.tsx      # Model performance dashboard
│   │   ├── Dataset.tsx          # Dataset explorer
│   │   ├── Documentation.tsx    # Project documentation
│   │   ├── About.tsx            # About page
│   │   └── NotFound.tsx         # 404 page
│   │
│   ├── test/                    # Test files (2 files)
│   │
│   ├── App.css                  # Application styles
│   ├── App.tsx                  # Root application component
│   ├── index.css                # Global styles
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts           # Vite type definitions
│
├── supabase/                    # Supabase configuration (8 files)
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── README.md                    # Project README
├── bun.lockb                    # Bun lock file
├── components.json              # shadcn/ui configuration
├── eslint.config.js            # ESLint configuration
├── index.html                   # HTML entry point
├── package.json                 # NPM dependencies
├── package-lock.json            # NPM lock file
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # TypeScript app configuration
├── tsconfig.node.json          # TypeScript node configuration
├── vite.config.ts              # Vite configuration
└── vitest.config.ts            # Vitest configuration
```

---

## 🎨 Features & Pages

### 1. **Landing Page** (`Index.tsx`) - Home
**URL**: `/`

The home page showcases the platform's capabilities with a modern, responsive design:

#### Hero Section
- **Animated Background**: Gradient background with pulsing molecular elements
- **Badge**: "AI-Powered Drug Discovery" with sparkles icon
- **Main Heading**: "Smart Drug-Protein Binding Prediction"
- **Description**: Brief overview of the platform's capabilities
- **Primary CTA Button**: "Start Prediction" → navigates to `/prediction`
- **Secondary Button**: "View Model Performance" → navigates to `/performance`
- **Floating Elements**: DNA and Target icons (hidden on mobile)

#### Stats Section
Displays key performance metrics in a 4-column grid (2 columns on mobile):
- **100,000+** Training Samples
- **0.76** Pearson R
- **25%** RMSE Reduction
- **>70%** Binding Site Overlap

#### Features Section
Four interactive feature cards with hover effects:
1. **Drug-Protein Prediction** (Flask icon)
   - Description: Predict binding affinity using deep learning
   - Links to: `/prediction`
2. **AI Explainability** (Brain icon)
   - Description: SHAP values and attention heatmaps
   - Links to: `/explainability`
3. **Model Performance** (BarChart icon)
   - Description: Compare baseline vs deep learning models
   - Links to: `/performance`
4. **Dataset Explorer** (Database icon)
   - Description: Explore BindingDB and PDBbind datasets
   - Links to: `/dataset`

#### AI Pipeline Architecture Section
Vertical flowchart showing the ML pipeline:
1. SMILES + FASTA Input (Flask icon)
2. Preprocessing & Validation (Shield icon)
3. GNN (Drug) + Transformer (Protein) (Brain icon)
4. Fusion Dense Layers (Layers icon)
5. Predicted Binding Affinity (pK) (Target icon)

**Additional Info Cards**:
- GNN Encoder (Graph Neural Network)
- Transformer (Protein Encoder)

#### Call-to-Action Section
- **Heading**: "Ready to Start Predicting?"
- **Description**: Upload SMILES and FASTA for instant predictions
- **Buttons**:
  - "Start Prediction" → `/prediction`
  - "Explore Datasets" → `/dataset`

#### Footer
- DrugBind AI logo and name
- Tagline: "Drug-Protein Binding Prediction using Deep Learning"

---

### 2. **Prediction Page** (`Prediction.tsx`) - Binding Prediction
**URL**: `/prediction`

Drug-protein binding affinity prediction interface with AI-powered features:

#### Header Section
- **Title**: "Binding Prediction"
- **Description**: Enter drug SMILES and protein FASTA sequences
- **Button**: "View History" / "Hide History" → toggles prediction history panel

#### Prediction History Panel (Collapsible)
- Shows previous predictions with:
  - Prediction ID
  - SMILES and FASTA (truncated)
  - Predicted pK value
  - Confidence score
  - Timestamp
- **Click to Load**: Loads previous prediction into input fields

#### AI Molecule Generator
- **Component**: `MoleculeGenerator`
- **Features**:
  - Generate SMILES from drug names
  - Generate FASTA from protein names
  - AI-powered conversion using sample database

#### External Resources Section
Links to external databases for SMILES and FASTA:
- **Drug SMILES Sources**:
  - PubChem
  - DrugBank
  - ChEMBL
- **Protein FASTA Sources**:
  - UniProt
  - RCSB PDB
  - PDBbind

#### Input Section
1. **Molecule Input** (`MoleculeInput` component)
   - Label: "Drug SMILES"
   - Validation: Real-time SMILES validation
   - Placeholder: Example SMILES notation
   
2. **Protein Input** (`ProteinInput` component)
   - Label: "Protein FASTA"
   - Validation: Sequence length check (30-10,000 amino acids)
   - Placeholder: Example FASTA sequence

#### Prediction Button
- **Text**: "Predict Binding Affinity"
- **Loading State**: "Analyzing with AI..." with spinner
- **Disabled**: When inputs are empty or invalid
- **Variant**: Scientific (primary blue)

#### Results Section (`PredictionResult` component)
Displays after successful prediction:
- **Prediction ID**: Unique identifier
- **Binding Affinity**: pK value with color coding
- **Confidence Score**: Percentage with progress bar
- **Interpretation**: Text explanation of pK value
- **Buttons**:
  - "View Explainability" → navigates to `/explainability` with data
  - "Save to Favorites"
  - "Export as PDF"

---

### 3. **Explainability Page** (`Explainability.tsx`) - AI Explainability
**URL**: `/explainability`

AI model interpretability and visualization features:

#### Header Section
- **Title**: "Explainability Analysis"
- **Description**: Understand which atoms and residues contribute to binding
- **Buttons**:
  - "History" / "Hide" → toggles prediction history
  - "New Prediction" → returns to `/prediction`
  - "Download Detailed PDF" → generates comprehensive PDF report

#### Prediction Summary Card
- **Prediction ID**: Unique identifier with monospace font
- **Binding Affinity**: Large pK value in primary color
- **Confidence**: Percentage in success color

#### Input Summary Section
Two-column grid showing:
1. **Drug SMILES**: Full SMILES string in code block
2. **Protein FASTA**: FASTA sequence (first 200 chars) in scrollable code block

#### 3D Molecular Visualization Section
**Toggle Button**: Show/Hide 3D View

Two-column grid with interactive 3D viewers:
1. **Drug Molecule** (`MoleculeViewer3D`)
   - Interactive 3D molecular structure
   - Atoms colored by importance (SHAP values)
   - Bond colors indicate binding strength:
     - Green: Strong binding (pK >9)
     - Yellow: Moderate binding (pK 5-9)
     - Red: Weak binding (pK <5)
   - Rotation and zoom controls

2. **Protein Structure** (`ProteinViewer3D`)
   - 3D protein backbone visualization
   - Residues colored by attention weights
   - Highlights binding site residues
   - Interactive controls

#### Explainability Tabs
**Tab 1: Drug Atoms (SHAP Analysis)**
- **Component**: `AtomHeatmap`
- **Features**:
  - Heatmap of atom importance scores
  - Color gradient: Low (blue) → High (red)
  - Atom symbols and indices
  - Importance percentages
  - Highlights critical atoms (>50% importance)

**Tab 2: Protein Residues (Attention Weights)**
- **Component**: `ResidueHeatmap`
- **Features**:
  - Residue-level attention visualization
  - Sequence position mapping
  - Amino acid one-letter codes
  - Attention weight percentages
  - Binding site prediction (>60% attention)

#### Scientific Interpretation Section
Detailed explanations:
1. **SHAP Analysis**: Explains atom contributions, hydrogen bonding, electrostatic interactions
2. **Attention Weights**: Describes binding site residues, charged and aromatic residues
3. **3D Visualization**: Bond color coding and interaction strength interpretation

---

### 4. **Performance Page** (`Performance.tsx`) - Model Performance Analysis
**URL**: `/performance`

Comprehensive model comparison and analytics dashboard:

#### Header Section
- **Title**: "Model Performance Analysis"
- **Description**: Comparison of baseline vs deep learning models on 10,000 test samples

#### Model Comparison Context Card
Two-column comparison:
1. **Baseline: Random Forest**
   - Traditional ML approach
   - Morgan fingerprints (2048 bits)
   - Industry standard benchmark
   
2. **Deep Learning: GNN + Transformer**
   - State-of-the-art architecture
   - Graph Attention Networks + Transformers
   - Production target model

**Dataset Info**: 90,000 training pairs, 10,000 validation samples

#### Key Metrics Cards (4-column grid)
Each card shows baseline vs DL comparison:

1. **RMSE** (Root Mean Square Error)
   - Baseline: 1.42 pK
   - DL: 1.07 pK
   - Improvement: 25% reduction
   - Info tooltip: Explains RMSE significance

2. **MAE** (Mean Absolute Error)
   - Baseline: 1.08 pK
   - DL: 0.82 pK
   - Improvement: 24% reduction

3. **Pearson R** (Correlation)
   - Baseline: 0.58
   - DL: 0.76
   - Improvement: 31% improvement

4. **R²** (R-squared)
   - Baseline: 0.34
   - DL: 0.58
   - Improvement: 71% improvement

#### Tabbed Chart Sections

**Tab 1: Accuracy Analysis**
- **Prediction Scatter (Baseline)**: Predicted vs Actual plot with explanation
- **Prediction Scatter (DL)**: Shows tighter clustering, better accuracy
- **Correlation Metrics Comparison**: Bar chart comparing Pearson R and R²
- **Model Comparison Radar**: Multi-dimensional performance visualization

**Tab 2: Error Distribution**
- **Error Distribution Histogram**: Frequency of prediction errors
- **Confidence Calibration**: Model confidence vs actual accuracy
- **RMSE & MAE Comparison**: Side-by-side error metrics

**Tab 3: Training Dynamics**
- **Training Loss Curve**: Training and validation loss over epochs
- **Learning Curve**: Performance vs training data size
- Shows convergence, overfitting analysis

**Tab 4: Performance Breakdown**
- **Performance by Affinity Range**: Low/Medium/High pK ranges
- **Performance by Protein Family**: Kinases, GPCRs, Proteases, Nuclear Receptors

Each chart includes detailed explanations of:
- What the chart shows
- Why the values matter
- Clinical/scientific significance

#### Model Architecture Details
Two-column comparison cards:

**Baseline: Random Forest**
- Features: Morgan fingerprints (2048 bits, radius 2)
- Architecture: 100 trees, max depth 20
- Training: 90,000 samples, ~5 minutes (CPU)
- Limitations: Loses 3D structure, no protein sequence modeling

**Deep Learning: GNN + Transformer**
- Drug encoder: Graph Attention Network (3 layers, 256 dim)
- Protein encoder: Transformer (6 layers, 512 dim, 8 heads)
- Fusion: Cross-attention + Dense layers (512 → 256 → 1)
- Training: 90,000 samples, ~4 hours (NVIDIA A100 GPU)
- Advantages: Preserves topology, learns protein patterns

#### Key Takeaways Summary
Three highlighted achievements:
1. **25% lower RMSE**: More accurate predictions
2. **31% higher correlation**: Pearson R exceeds 0.70 threshold
3. **Better calibration**: Trustworthy confidence scores

---

### 5. **Dataset Page** (`Dataset.tsx`) - Dataset Explorer
**URL**: `/dataset`

Explore and analyze training datasets with advanced filtering:

#### Header Section
- **Title**: "Dataset Explorer"
- **Description**: Explore BindingDB and PDBbind datasets

#### External Data Resources Section
Grid of 6 clickable cards linking to:
1. **BindingDB**: Binding affinity database
2. **PDBbind**: Protein-ligand complexes with 3D structures
3. **ChEMBL**: Bioactive molecules database
4. **PubChem**: Chemical information database
5. **DrugBank**: Drug and drug target database
6. **UniProt**: Protein sequence and annotation database

Each card shows:
- Database name
- Brief description
- Chevron icon indicating external link

#### Dataset Overview Cards (2-column grid)

**Card 1: BindingDB**
- **Badge**: "Primary Training"
- **Description**: Measured binding affinities for drug-like molecules
- **Statistics**:
  - Total entries: 2,500,000
  - After filtering: 245,000
  - Training samples: 100,000
- **Button**: "Visit BindingDB" (external link)

**Card 2: PDBbind / RCSB PDB**
- **Badge**: "Validation"
- **Description**: Binding affinity data with 3D structural information
- **Statistics**:
  - Total entries: 23,496
  - After filtering: 19,443
  - Validation samples: 10,000
- **Button**: "Visit RCSB Protein Data Bank"

#### Data Preprocessing Pipeline
4-column grid showing preprocessing steps:
1. **8-10%**: Invalid SMILES Removed (red)
2. **30-10,000**: Amino Acid Length Filter (yellow)
3. **pK Scale**: Kd, Ki, IC50 → pK Conversion (blue)
4. **Deduplicated**: Duplicate Entries Removed (green)

#### Sample Data Explorer Section

**Header**:
- Title: "Sample Data Explorer (10,000 entries)"
- **Buttons**:
  - "Export CSV" → downloads filtered data as CSV
  - "Export JSON" → downloads filtered data as JSON

**Search & Filter Controls**:
- **Quick Search Bar**: Search by drug name, target, or SMILES
- **Show/Hide Filters Button**: Toggles advanced filter panel
  - Shows active filter count badge

**Advanced Filter Panel** (`FilterPanel` component):
- **Data Source**: All / BindingDB / PDBbind / ChEMBL
- **pK Range**: Slider (0-15)
- **Protein Category**: Dropdown (All / Kinase / GPCR / Protease / etc.)
- **Show Invalid Data**: Checkbox
- **Clear Filters Button**: Resets all filters

**Results Summary**:
- Shows: "Showing X of Y filtered entries (Z filtered out)"

**Data Table** (scrollable, max height 600px):
Columns (18 total):
1. ID
2. Drug Name
3. SMILES (truncated with hover tooltip)
4. Target Protein
5. FASTA (preview, truncated)
6. pK (binding affinity)
7. Source (badge: BindingDB/PDBbind/ChEMBL)
8. Atom Importance (0-1)
9. Residue Importance (0-1)
10. Binding Site Score (0-1)
11. Hydrophobic Score (0-1)
12. Electrostatic Score (0-1)
13. H-Bond Score (0-1)
14. Van der Waals (0-1)
15. Solvation Score (0-1)
16. Entropy Score (0-1)
17. Overall Confidence (0-1)
18. Status (Valid/Invalid badge)

**Features**:
- Sticky header
- Hover row highlighting
- Displays first 100 results
- Monospace font for SMILES/FASTA
- Color-coded badges

**Footer Note**: Export CSV to get all 10,000 samples with complete sequences

---

### 6. **Documentation Page** (`Documentation.tsx`) - Technical Documentation
**URL**: `/documentation`

Comprehensive technical documentation with PDF export:

#### Header Section
- **Title**: "Documentation"
- **Description**: Complete technical documentation for DrugBind AI
- **Button**: "Download PDF Documentation" → generates comprehensive PDF

#### Quick Reference Card
Visual pK score interpretation guide (6-column grid):
- **≥10**: Exceptional (green)
- **9-10**: Very High (emerald)
- **7-9**: High (blue)
- **5-7**: Moderate (yellow)
- **3-5**: Low (orange)
- **<3**: Negligible (red)

#### Documentation Sections (7 sections total)

**1. System Overview** (BookOpen icon)
- Platform description
- Target users
- Key features
- **Accordion Subsections**:
  - Target Users
  - Key Features

**2. Understanding pK Score** (Target icon)
- pK value explanation
- Logarithmic scale interpretation
- **Accordion Subsections**:
  - pK Score Ranges and Interpretation
  - Clinical Relevance
  - Affinity Unit Conversions

**3. Model Comparison Metrics** (Activity icon)
- Statistical measures explanation
- **Accordion Subsections**:
  - Root Mean Square Error (RMSE)
  - Mean Absolute Error (MAE)
  - Pearson Correlation (R)
  - R-squared (R²)
  - Concordance Index (CI)

**4. System Architecture** (Layers icon)
- ML pipeline overview
- **Accordion Subsections**:
  - Drug Encoding (Graph Neural Network)
  - Protein Encoding (Transformer)
  - Feature Fusion & Prediction

**5. Binding Prediction Module** (Flask icon)
- Input/output specifications
- **Accordion Subsections**:
  - Input Specifications
  - Output Interpretation
  - Confidence Score

**6. Explainability Analysis** (Brain icon)
- SHAP and attention weights
- **Accordion Subsections**:
  - SHAP Analysis (Drug Atoms)
  - Attention Weights (Protein Residues)
  - 3D Visualization

**7. Model Performance** (BarChart icon)
- Performance metrics
- **Accordion Subsections**:
  - Baseline Model (Random Forest)
  - Deep Learning Model (GNN + Transformer)
  - AutoDock Vina Comparison

**8. Training Datasets** (Database icon)
- Dataset information
- **Accordion Subsections**:
  - BindingDB (Primary Training)
  - PDBbind (Validation)
  - Preprocessing Pipeline

Each section includes:
- Icon and title
- Main content paragraphs
- Expandable accordion subsections with bullet points
- Chevron icons for list items

---

### 7. **About Page** (`About.tsx`) - About & Contact
**URL**: `/about`

Information about the developer, research, and contact form:

#### Header Section
- **Title**: "About"
- **Description**: Meet the developer and learn about the research

#### Developer Profile Card
- **Avatar**: Circular gradient with initials "VA"
- **Name**: Varun Agarwal
- **Badges**:
  - Student (GraduationCap icon)
  - RV College of Engineering (Building icon)
- **Bio**: Computer Science and Engineering (Cyber Security) student
- **Email**: varunagarwal0964@gmail.com (clickable mailto link)

#### Research Mentor Card
- **Avatar**: Circular gradient with initials "AHM"
- **Name**: Dr. A. H. Manjunatha Reddy
- **Title**: Professor, Department of Biotechnology
- **Institution**: RV College of Engineering®, Bengaluru, India
- **Email**: ahmanjunatha@rvce.edu.in

#### Research Publication Card
- **Title**: "Smart Drug–Protein Binding Prediction using AI"
- **Authors**: Varun Agarwal, Dr. A. H. Manjunatha Reddy
- **Institution**: RV College of Engineering®
- **Abstract**: Full research abstract in highlighted box
- **Keywords** (5 badges):
  - Drug-Target Binding
  - Graph Neural Network
  - Transformer
  - Explainable AI
  - SHAP
- **Button**: "Download Full Research Paper (PDF)" → downloads from `/research/`

#### Key Research Contributions (4-card grid)
1. **Data Preprocessing Pipeline**: SMILES/FASTA normalization and pK unification
2. **Multimodal Architecture**: GNN + Transformer integration (25% improvement)
3. **AutoDock Vina Comparison**: Rigorous docking score comparison
4. **Explainable AI**: SHAP and attention visualizations

#### Institution Card
- **Logo**: "RVCE" in rounded square
- **Name**: RV College of Engineering®
- **Location**: Bengaluru, Karnataka, India
- **Link**: "Visit Website" (external link to rvce.edu.in)

#### Contact Form
- **Title**: "Contact Me"
- **Description**: Questions or collaboration inquiries
- **Form Fields**:
  1. Your Name (text input)
  2. Your Email (email input)
  3. Message (textarea, 4 rows)
- **Button**: "Send Message" / "Sending..." (with loader)
- **Functionality**: Sends message via Supabase function

---

### 8. **404 Not Found Page** (`NotFound.tsx`)
**URL**: Any invalid route

Simple error page:
- **Message**: "Page not found"
- **Button**: "Go Home" → navigates to `/`

---

## 🧩 Components

### Assistant Components
- **VoiceAssistant.tsx**: AI voice assistant for guided usage
- **AssistantContext.tsx**: Context provider for assistant state

### Prediction Components
- **MoleculeInput.tsx**: SMILES input field with validation
- **ProteinInput.tsx**: FASTA sequence input
- **MoleculeGenerator.tsx**: Random molecule generator
- **PredictionResult.tsx**: Display prediction results
- **PredictionHistory.tsx**: Track and display prediction history

### Chart Components (6 files)
Recharts-based visualizations for:
- Performance metrics
- Training curves
- Correlation plots
- Distribution graphs
- Comparison charts

### Explainability Components (2 files)
- SHAP value visualizations
- Attention heatmap renderers

### Layout Components (2 files)
- **AppLayout**: Main application layout wrapper
- Navigation structure

### Visualization Components (2 files)
- Molecular structure viewers
- 3D protein structure visualizations

### UI Components (49 shadcn/ui components)
Including: Accordion, Alert Dialog, Avatar, Button, Card, Checkbox, Dialog, Dropdown Menu, Form, Input, Label, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Tooltip, and more.

### Utility Components
- **NavLink.tsx**: Custom navigation link with active state
- **ThemeToggle.tsx**: Dark/Light mode switcher with system preference

---

## 📊 Data & Models

### Dataset Samples (`datasetSamples.ts`)
Contains **10,000 generated dataset entries** with:

#### Data Structure
```typescript
interface DatasetEntry {
  id: number;
  smiles: string;              // Drug molecule SMILES notation
  target: string;              // Protein target name
  fasta: string;               // Protein FASTA sequence
  pk: number | null;           // Binding affinity (pK value)
  source: 'BindingDB' | 'PDBbind' | 'ChEMBL';
  valid: boolean;              // Data validity flag
  drugName?: string;           // Drug compound name
  uniprotId?: string;          // UniProt protein ID
  
  // Importance scores (0-1 scale)
  atomImportance: number;
  residueImportance: number;
  bindingSiteScore: number;
  hydrophobicScore: number;
  electrostaticScore: number;
  hydrogenBondScore: number;
  vanDerWaalsScore: number;
  solvationScore: number;
  entropyScore: number;
  overallConfidence: number;
}
```

#### Drug Compounds
The dataset includes **60+ realistic drug compounds** such as:
- **COX Inhibitors**: Aspirin, Ibuprofen, Naproxen, Celecoxib
- **Kinase Inhibitors**: Ponatinib, Imatinib, Lapatinib, Nilotinib, Crizotinib, Gefitinib
- **JAK Inhibitors**: Ruxolitinib, Tofacitinib
- **PDE Inhibitors**: Sildenafil, Tadalafil
- **Protease Inhibitors**: Lopinavir, Amprenavir, Bortezomib
- **Statins**: Lovastatin, Atorvastatin
- **Anticoagulants**: Warfarin, Nifedipine
- **CNS Drugs**: Caffeine, Methamphetamine, Cocaine
- **Antibiotics**: Penicillin G, Cycloserine
- **Antivirals**: Tenofovir
- **mTOR Inhibitors**: Rapamycin
- **HDAC Inhibitors**: Vorinostat

#### Protein Targets (50+ targets)
Organized by categories:
- **Kinases**: EGFR, BCR-ABL, JAK2, BRAF, AMPK, Aurora Kinase, CDK2, PKC, FGFR1, PI3K, GSK3β
- **GPCRs**: Beta-2 Adrenergic, Dopamine D2, Histamine H1, Adenosine A2A
- **Proteases**: HIV Protease, SARS-CoV-2 Mpro, Thrombin, Factor Xa, Caspase-3, MMP9
- **Oxidoreductases**: COX-1, COX-2, Tyrosinase, MAO-A, MAO-B, Xanthine Oxidase
- **Ion Channels**: Nav1.5, L-type Ca²⁺, hERG K⁺, GABA-A, NMDA
- **Transporters**: DAT, SERT, NET, P-glycoprotein
- **Nuclear Receptors**: Androgen Receptor, Estrogen Receptor, PPARγ
- **Hydrolases**: Acetylcholinesterase, HDAC1, SIRT1
- **Others**: ACE2, Insulin Receptor, HMG-CoA Reductase, DHFR

#### FASTA Sequences
Real protein sequences for major drug targets:
- COX-2, COX-1
- EGFR, BRAF
- ACE2
- AMPK, JAK2
- HIV Protease
- SARS-CoV-2 Main Protease
- ABL Kinase
- Acetylcholinesterase
- Dopamine D2 Receptor
- Insulin Receptor
- HMG-CoA Reductase
- Thrombin
- PDE5

#### Dataset Links
- **BindingDB**: https://www.bindingdb.org
- **PDBbind**: http://pdbbind.org.cn
- **ChEMBL**: https://www.ebi.ac.uk/chembl
- **PubChem**: https://pubchem.ncbi.nlm.nih.gov
- **DrugBank**: https://go.drugbank.com
- **RCSB PDB**: https://www.rcsb.org
- **UniProt**: https://www.uniprot.org

---

## ⚙️ Configuration

### Environment Variables (`.env`)
```env
VITE_SUPABASE_PROJECT_ID=sxwwzldmmaktavdbgfyw
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://sxwwzldmmaktavdbgfyw.supabase.co
```

### Vite Configuration (`vite.config.ts`)
- **Server**: Runs on `::` (all interfaces), port **8080**
- **HMR**: Hot Module Replacement enabled (overlay disabled)
- **Plugins**: React SWC + Lovable Tagger (dev mode only)
- **Path Alias**: `@` → `./src`

### Tailwind Configuration (`tailwind.config.ts`)
**Custom Color Palette**:
- Primary, Secondary, Accent colors
- Success, Warning, Destructive states
- Chart colors (primary, secondary, tertiary, quaternary, baseline)
- Atom colors (Carbon, Nitrogen, Oxygen, Sulfur)
- Residue colors (Active, Inactive)
- Dark mode support via class strategy

**Custom Fonts**:
- Sans: Inter, system-ui
- Mono: JetBrains Mono

**Custom Animations**:
- Fade-in, Slide-in-right, Scale-in
- Accordion animations

### TypeScript Configuration
- **Strict mode** enabled
- **ES2020** target
- **Module resolution**: bundler
- **JSX**: react-jsx

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun package manager

### Installation Steps

1. **Clone the repository**:
```bash
git clone <repository-url>
cd binding-insight-ai-main
```

2. **Install dependencies**:
```bash
npm install
# or
bun install
```

3. **Configure environment**:
   - Ensure `.env` file is present with Supabase credentials
   - (The project already includes default configuration)

4. **Verify installation**:
   - Check `node_modules` exists
   - Verify `package-lock.json` is up to date

---

## ▶️ Running the Project

### Development Server
```bash
npm run dev
```
- Opens at: `http://localhost:8080`
- Hot reload enabled
- Dark/Light theme support

### Production Build
```bash
npm run build
```
- Builds optimized production bundle to `dist/`

### Development Build
```bash
npm run build:dev
```
- Builds in development mode

### Preview Production Build
```bash
npm run preview
```
- Preview the production build locally

### Linting
```bash
npm run lint
```
- Runs ESLint on the codebase

### Testing
```bash
npm run test        # Run tests once
npm run test:watch  # Run tests in watch mode
```

---

## 📦 Dependencies

### Production Dependencies (66 packages)
Key dependencies include:
- **React Ecosystem**: react, react-dom, react-router-dom, react-hook-form
- **Radix UI**: 23 component packages
- **State Management**: @tanstack/react-query
- **Backend**: @supabase/supabase-js
- **Styling**: tailwindcss, tailwind-merge, tailwindcss-animate, class-variance-authority
- **Charts**: recharts, jspdf
- **Utilities**: date-fns, zod, clsx, cmdk
- **Icons**: lucide-react
- **Theming**: next-themes
- **UI Components**: Various radix-ui packages

### Development Dependencies (17 packages)
- **Build Tools**: vite, @vitejs/plugin-react-swc
- **TypeScript**: typescript, @types/react, @types/react-dom, @types/node
- **Linting**: eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh
- **Testing**: vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- **CSS**: postcss, autoprefixer, @tailwindcss/typography
- **Utilities**: lovable-tagger, globals, typescript-eslint

---

## 🏗 Architecture

### AI Pipeline
The platform uses a multi-stage deep learning pipeline:

```
1. Input Layer
   ├── SMILES (Drug Molecule)
   └── FASTA (Protein Sequence)
   
2. Preprocessing & Validation
   ├── SMILES validation
   ├── FASTA validation
   └── Feature extraction
   
3. Encoding
   ├── GNN (Graph Neural Network) for drug molecules
   └── Transformer for protein sequences
   
4. Fusion
   └── Dense layers combine drug and protein representations
   
5. Output
   └── Predicted Binding Affinity (pK value) + Confidence Scores
```

### Frontend Architecture
- **Component-Based**: Modular React components
- **Type-Safe**: Full TypeScript coverage
- **Responsive**: Mobile-first design with Tailwind CSS
- **Accessible**: Radix UI primitives ensure WCAG compliance
- **State Management**: React Query for server state, Context API for UI state
- **Routing**: React Router for client-side navigation
- **Theme**: System-aware dark/light mode

### Backend Integration
- **Supabase**: PostgreSQL database + Authentication + Real-time subscriptions
- **REST API**: For predictions and data fetching
- **File Storage**: Research papers and assets

### Design System
- **Colors**: Semantic color tokens (primary, secondary, accent, etc.)
- **Typography**: Inter (body), JetBrains Mono (code)
- **Components**: shadcn/ui component library
- **Spacing**: Consistent 4px grid system
- **Animations**: Subtle micro-interactions for better UX

---

## 📄 Additional Files

### Research Paper
- Located at: `public/research/DrugBind_AI_Research_Paper.pdf`
- Accessible from the Documentation page

### Assets
- **Favicons**: `favicon.ico`, `favicon.png`
- **Placeholder**: `placeholder.svg`
- **SEO**: `robots.txt`

---

## 🎯 Key Features Summary

1. **AI-Powered Predictions**: State-of-the-art GNN + Transformer architecture
2. **Explainable AI**: SHAP values and attention mechanisms for transparency
3. **Large-Scale Datasets**: 180K+ training samples from multiple sources
4. **Performance Tracking**: Real-time comparison of models
5. **Voice Assistant**: Guided user experience
6. **Dark Mode**: Full theme customization
7. **Responsive Design**: Works on desktop, tablet, and mobile
8. **Type-Safe**: Complete TypeScript coverage
9. **Modern Stack**: Latest React, Vite, and Tailwind technologies
10. **Professional UI**: Premium design with shadcn/ui components

---

## 📞 Support & Documentation

For more information:
- Review the **Documentation** page in the app
- Check the research paper in `public/research/`
- Explore the codebase starting from `src/App.tsx`

---

**Last Updated**: February 3, 2026  
**Version**: 0.0.0  
**Framework**: React + Vite + TypeScript + Tailwind CSS + Supabase
