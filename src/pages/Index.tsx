import { Link } from "react-router-dom";
import {
  FlaskConical,
  Brain,
  BarChart3,
  Database,
  ArrowRight,
  Dna,
  Target,
  Sparkles,
  Shield,
  ArrowDown,
  Layers,
  Atom
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";

const features = [
  {
    icon: FlaskConical,
    title: "Drug-Protein Prediction",
    description: "Predict binding affinity (pK) between drug molecules and protein targets using state-of-the-art deep learning.",
    link: "/prediction",
  },
  {
    icon: Brain,
    title: "AI Explainability",
    description: "Understand model decisions with SHAP values and attention heatmaps highlighting key atoms and residues.",
    link: "/explainability",
  },
  {
    icon: BarChart3,
    title: "Model Performance",
    description: "Compare baseline (Random Forest) vs deep learning (GNN + Transformer) with comprehensive metrics.",
    link: "/performance",
  },
  {
    icon: FlaskConical,
    title: "Drug Likeness Analysis",
    description: "Evaluate drug candidates against Lipinski's Rule of 5, Ghose Filter, and Veber's Rules.",
    link: "/drug-likeness",
  },
  {
    icon: Layers,
    title: "Prediction History",
    description: "Track your past predictions, view trends, and export results for further analysis.",
    link: "/history",
  },
  {
    icon: Database,
    title: "Dataset Explorer",
    description: "Explore BindingDB and PDBbind datasets used for training and validation.",
    link: "/dataset",
  },
];

const stats = [
  { value: "100,000+", label: "Training Samples" },
  { value: "0.76", label: "Pearson R" },
  { value: "25%", label: "RMSE Reduction" },
  { value: ">70%", label: "Binding Site Overlap" },
];

const pipelineSteps = [
  { label: 'SMILES + FASTA Input', icon: FlaskConical, color: 'bg-primary' },
  { label: 'Preprocessing & Validation', icon: Shield, color: 'bg-primary' },
  { label: 'GNN (Drug) + Transformer (Protein)', icon: Brain, color: 'bg-primary' },
  { label: 'Fusion Dense Layers', icon: Layers, color: 'bg-primary' },
  { label: 'Predicted Binding Affinity (pK)', icon: Target, color: 'bg-primary' },
];

export default function Index() {
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute inset-0 bg-grid opacity-50" />
          {/* Animated molecules background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in border border-primary/20">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>AI-Powered Drug Discovery</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 animate-fade-in">
                Smart Drug-Protein
                <span className="text-gradient-primary block mt-1 sm:mt-2">Binding Prediction</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto animate-fade-in px-2">
                Accelerate drug discovery with deep learning. Predict binding affinities,
                visualize molecular interactions, and understand AI decisions with explainable models.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in px-4 sm:px-0">
                <Button asChild size="lg" variant="scientific" className="w-full sm:w-auto">
                  <Link to="/prediction">
                    Start Prediction
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/performance">
                    View Model Performance
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Floating Elements - Hidden on mobile */}
          <div className="absolute top-1/4 left-10 opacity-20 animate-pulse-subtle hidden sm:block">
            <Dna className="h-16 sm:h-24 w-16 sm:w-24 text-primary" />
          </div>
          <div className="absolute bottom-1/4 right-10 opacity-20 animate-pulse-subtle hidden sm:block">
            <Target className="h-14 sm:h-20 w-14 sm:w-20 text-accent" />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 sm:py-12 border-y border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center group">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                Comprehensive Drug Discovery Platform
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                From prediction to explainability, our platform provides everything you need
                for AI-assisted drug-protein interaction analysis.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {features.map((feature, idx) => (
                <Link
                  key={idx}
                  to={feature.link}
                  className="group card-scientific p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all shadow-lg">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture Section - Vertical Pipeline */}
        <section className="py-12 sm:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                  AI Pipeline Architecture
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground px-2">
                  Our model combines Graph Neural Networks for molecular representation
                  with Transformers for protein sequence encoding.
                </p>
              </div>

              <div className="card-scientific p-4 sm:p-8 md:p-12">
                <div className="flex flex-col items-center">
                  {pipelineSteps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center w-full">
                      {/* Step */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 group w-full">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground border-2 border-primary/30 group-hover:bg-primary/80 transition-all duration-300 shadow-lg flex-shrink-0">
                          <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <span className="text-sm sm:text-base md:text-lg font-medium text-foreground text-center sm:text-left sm:min-w-[280px]">
                          {step.label}
                        </span>
                      </div>

                      {/* Arrow between steps */}
                      {idx < pipelineSteps.length - 1 && (
                        <div className="flex flex-col items-center my-2 sm:my-3">
                          <div className="w-0.5 h-4 sm:h-6 bg-gradient-to-b from-primary/40 to-primary/20" />
                          <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 -mt-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Additional info */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border grid grid-cols-2 gap-2 sm:gap-4 text-center">
                  <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
                    <Atom className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm font-medium text-foreground">GNN Encoder</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Graph Neural Network</div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-accent mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm font-medium text-foreground">Transformer</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Protein Encoder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                Ready to Start Predicting?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-2">
                Upload your drug SMILES and protein FASTA sequences to get instant
                binding affinity predictions with confidence scores.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <Button asChild size="lg" variant="scientific" className="w-full sm:w-auto">
                  <Link to="/prediction">
                    <FlaskConical className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Start Prediction
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/dataset">
                    <Database className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Explore Datasets
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 sm:py-8 border-t border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <span className="font-semibold text-sm sm:text-base text-foreground">DrugBind AI</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Drug-Protein Binding Prediction using Deep Learning
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
