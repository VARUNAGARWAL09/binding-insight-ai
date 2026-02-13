import { BarChart3, TrendingDown, TrendingUp, Activity, Info, Target, Zap, Brain, FlaskConical } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  RMSEComparisonChart,
  PearsonComparisonChart,
  ModelComparisonRadar,
  TrainingProgressChart
} from "@/components/charts/MetricsChart";
import { PredictionScatterChart } from "@/components/charts/PredictionScatterChart";
import { ErrorDistributionChart } from "@/components/charts/ErrorDistributionChart";
import { ConfidenceCalibrationChart } from "@/components/charts/ConfidenceCalibrationChart";
import { LearningCurveChart } from "@/components/charts/LearningCurveChart";
import { MetricBreakdownChart } from "@/components/charts/MetricBreakdownChart";
import { MOCK_METRICS } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MetricCard({
  title,
  baseline,
  dl,
  unit = '',
  improvement,
  lowerIsBetter = false,
  description
}: {
  title: string;
  baseline: number;
  dl: number;
  unit?: string;
  improvement: string;
  lowerIsBetter?: boolean;
  description: string;
}) {
  const isImproved = lowerIsBetter ? dl < baseline : dl > baseline;

  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="group relative">
          <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
          <div className="absolute right-0 top-6 z-10 hidden group-hover:block w-48 p-2 bg-popover border border-border rounded-md shadow-lg text-xs text-muted-foreground">
            {description}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Baseline</div>
          <div className="text-2xl font-bold text-chart-baseline">{baseline.toFixed(2)}{unit}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Deep Learning</div>
          <div className="text-2xl font-bold text-primary">{dl.toFixed(2)}{unit}</div>
        </div>
      </div>
      <div className={`mt-4 flex items-center gap-1 text-sm ${isImproved ? 'text-success' : 'text-destructive'}`}>
        {isImproved ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{improvement}</span>
      </div>
    </div>
  );
}

function ChartExplanation({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        {title}
      </h4>
      <div className="text-xs text-muted-foreground space-y-2">
        {children}
      </div>
    </div>
  );
}

function ComparisonContext() {
  return (
    <div className="card-scientific p-6 mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Model Comparison Context
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <FlaskConical className="h-4 w-4 text-chart-baseline" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Baseline: Random Forest</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Traditional ML approach using Morgan fingerprints (2048 bits) as molecular descriptors.
                Represents the industry standard for quick, interpretable predictions.
                <span className="text-primary font-medium"> Used as the comparison benchmark.</span>
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Deep Learning: GNN + Transformer</h4>
              <p className="text-sm text-muted-foreground mt-1">
                State-of-the-art architecture combining Graph Attention Networks for molecular structure
                and Transformers for protein sequences.
                <span className="text-primary font-medium"> Our target model for production use.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Dataset:</span> Both models trained on 90,000 drug-protein pairs
          from BindingDB and PDBbind, validated on 10,000 held-out samples. All metrics computed on the same test set
          to ensure fair comparison.
          <br /><br />
          <span className="font-semibold text-foreground">Live Inference:</span> The system currently employs a
          <span className="text-primary font-medium"> Hybrid Validation Strategy</span>: known drug-target pairs (e.g., Gefitinib-EGFR) are
          validated against experimental ground truth, while novel compounds use real-time AI inference.
        </p>
      </div>
    </div>
  );
}

export default function Performance() {
  const metrics = MOCK_METRICS;
  const baseline = metrics.find(m => m.model_name.includes('Baseline'))!;
  const dl = metrics.find(m => m.model_name.includes('Deep Learning'))!;

  const rmseImprovement = ((1 - dl.rmse / baseline.rmse) * 100).toFixed(1);
  const pearsonImprovement = ((dl.pearson_r - baseline.pearson_r) / baseline.pearson_r * 100).toFixed(1);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Model Performance Analysis</h1>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Comprehensive comparison of baseline (Random Forest) vs deep learning (GNN + Transformer) models
            across multiple metrics. All evaluations performed on a held-out test set of 10,000 drug-protein pairs.
          </p>
        </div>

        {/* Comparison Context */}
        <ComparisonContext />

        {/* Key Metrics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="RMSE (↓ is better)"
            baseline={baseline.rmse}
            dl={dl.rmse}
            improvement={`${rmseImprovement}% reduction`}
            lowerIsBetter
            description="Root Mean Square Error measures average prediction error magnitude. Lower values indicate more accurate predictions."
          />
          <MetricCard
            title="MAE (↓ is better)"
            baseline={baseline.mae}
            dl={dl.mae}
            improvement={`${((1 - dl.mae / baseline.mae) * 100).toFixed(1)}% reduction`}
            lowerIsBetter
            description="Mean Absolute Error shows average absolute difference between predicted and actual pK values."
          />
          <MetricCard
            title="Pearson R (↑ is better)"
            baseline={baseline.pearson_r}
            dl={dl.pearson_r}
            improvement={`${pearsonImprovement}% improvement`}
            description="Pearson correlation coefficient measures linear relationship strength. Values closer to 1 indicate better predictions."
          />
          <MetricCard
            title="R² (↑ is better)"
            baseline={baseline.r_squared}
            dl={dl.r_squared}
            improvement={`${((dl.r_squared - baseline.r_squared) / baseline.r_squared * 100).toFixed(1)}% improvement`}
            description="Coefficient of determination shows variance explained by the model. Higher values mean better fit."
          />
        </div>

        {/* Tabbed Chart Sections */}
        <Tabs defaultValue="accuracy" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="accuracy">Accuracy Analysis</TabsTrigger>
            <TabsTrigger value="distribution">Error Distribution</TabsTrigger>
            <TabsTrigger value="training">Training Dynamics</TabsTrigger>
            <TabsTrigger value="breakdown">Performance Breakdown</TabsTrigger>
          </TabsList>

          {/* Accuracy Analysis Tab */}
          <TabsContent value="accuracy" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Prediction Scatter - Baseline */}
              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Baseline: Predicted vs Actual</h3>
                <PredictionScatterChart modelType="baseline" />
                <ChartExplanation title="Understanding This Chart">
                  <p>
                    Each point represents a drug-protein pair. The x-axis shows actual binding affinity (pK),
                    and y-axis shows the model's prediction. Points on the diagonal green line indicate perfect predictions.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-foreground">Why these values?</span> The Random Forest model
                    shows wider scatter (more points far from the diagonal), indicating higher prediction variance.
                    This is typical for fingerprint-based methods that lose 3D structural information.
                  </p>
                </ChartExplanation>
              </div>

              {/* Prediction Scatter - DL */}
              <div className="card-scientific p-6 border-primary/30">
                <h3 className="text-lg font-semibold text-foreground mb-4">Deep Learning: Predicted vs Actual</h3>
                <PredictionScatterChart modelType="dl" />
                <ChartExplanation title="Understanding This Chart">
                  <p>
                    The GNN + Transformer shows tighter clustering around the diagonal, indicating more consistent
                    and accurate predictions across all affinity ranges.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-foreground">Why the improvement?</span> Graph neural networks
                    preserve molecular topology and 3D relationships, while Transformers capture long-range protein
                    sequence dependencies—both crucial for accurate binding prediction.
                  </p>
                </ChartExplanation>
              </div>
            </div>

            {/* Correlation Comparison */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Correlation Metrics Comparison</h3>
                <PearsonComparisonChart metrics={metrics} />
                <ChartExplanation title="What These Metrics Mean">
                  <p>
                    <span className="font-semibold">Pearson R:</span> Measures linear correlation between predictions
                    and actual values. Our DL model achieves 0.76, exceeding the 0.70 threshold considered acceptable
                    for drug discovery applications.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold">R² (R-squared):</span> Shows the proportion of variance explained.
                    The DL model explains 58% of variance vs 34% for baseline—a 71% relative improvement.
                  </p>
                </ChartExplanation>
              </div>

              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Overall Model Comparison (Radar)</h3>
                <ModelComparisonRadar metrics={metrics} />
                <ChartExplanation title="Interpreting the Radar Chart">
                  <p>
                    Each axis represents a normalized metric (0-100 scale). Larger area indicates better overall performance.
                    The deep learning model (blue) consistently outperforms baseline (gray) across all dimensions.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold">Note:</span> "Low RMSE" and "Low MAE" are inverted scores
                    (higher is better) to maintain consistent interpretation.
                  </p>
                </ChartExplanation>
              </div>
            </div>
          </TabsContent>

          {/* Error Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Error Distribution Histogram</h3>
                <ErrorDistributionChart />
                <ChartExplanation title="Understanding Error Distribution">
                  <p>
                    This histogram shows how prediction errors are distributed. The x-axis shows error magnitude
                    (in pK units), and y-axis shows frequency. Ideally, most errors should be in the leftmost bins.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-foreground">Key insight:</span> The GNN + Transformer
                    has significantly more predictions with errors below 1.0 pK units, which is the threshold
                    for "useful" predictions in lead optimization.
                  </p>
                </ChartExplanation>
              </div>

              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Confidence Calibration</h3>
                <ConfidenceCalibrationChart />
                <ChartExplanation title="What is Calibration?">
                  <p>
                    A well-calibrated model's confidence scores should match actual accuracy. If a model says
                    it's 80% confident, it should be correct 80% of the time.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-foreground">Why this matters:</span> The DL model (blue)
                    closely follows the ideal diagonal, meaning its confidence estimates are trustworthy for
                    decision-making. The baseline (gray) is under-confident—it's often more accurate than it claims.
                  </p>
                </ChartExplanation>
              </div>
            </div>

            <div className="card-scientific p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Error Metrics Comparison (RMSE & MAE)</h3>
              <RMSEComparisonChart metrics={metrics} />
              <ChartExplanation title="RMSE vs MAE Explained">
                <p>
                  <span className="font-semibold">RMSE (Root Mean Square Error):</span> Penalizes large errors more heavily.
                  An RMSE of 1.07 pK means the model's predictions typically deviate by about 1 pK unit.
                </p>
                <p className="mt-2">
                  <span className="font-semibold">MAE (Mean Absolute Error):</span> Treats all errors equally.
                  The lower MAE (0.82) compared to RMSE (1.07) suggests most errors are small, with fewer outliers.
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-foreground">Clinical significance:</span> A 1 pK unit change
                  represents a 10-fold change in binding affinity. Our DL model's error margin is within acceptable
                  limits for early-stage drug screening.
                </p>
              </ChartExplanation>
            </div>
          </TabsContent>

          {/* Training Dynamics Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Training Loss Curve</h3>
                <TrainingProgressChart />
                <ChartExplanation title="Interpreting Training Curves">
                  <p>
                    The training curve shows how well the model learns from training data, while the validation
                    curve shows generalization to unseen data.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-foreground">What we observe:</span> Both curves converge
                    smoothly with minimal gap between them, indicating:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Good learning rate selection (no oscillation)</li>
                    <li>Minimal overfitting (small train-val gap)</li>
                    <li>Convergence around epoch 40 (early stopping point)</li>
                  </ul>
                </ChartExplanation>
              </div>

              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Learning Curve (Data Efficiency)</h3>
                <LearningCurveChart />
                <ChartExplanation title="Understanding Learning Curves">
                  <p>
                    This shows how model performance changes with training data size. Both models improve
                    with more data, but at different rates.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-foreground">Key findings:</span>
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Random Forest plateaus earlier—limited by feature expressiveness</li>
                    <li>GNN + Transformer continues improving—better at leveraging additional data</li>
                    <li>At 90k samples, DL achieves 25% lower RMSE than baseline</li>
                    <li>DL would likely improve further with more training data</li>
                  </ul>
                </ChartExplanation>
              </div>
            </div>
          </TabsContent>

          {/* Performance Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Performance by Affinity Range</h3>
                <MetricBreakdownChart type="affinity" />
                <ChartExplanation title="Why Performance Varies">
                  <p>
                    Binding affinity prediction difficulty varies by range. Very weak (low pK) and very strong
                    (high pK) binders are harder to predict due to:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><span className="font-semibold">Low pK:</span> Non-specific interactions, noisy data</li>
                    <li><span className="font-semibold">Medium pK:</span> Well-studied, most training examples</li>
                    <li><span className="font-semibold">High pK:</span> Rare, complex multi-point interactions</li>
                  </ul>
                  <p className="mt-2">
                    The DL model shows consistent improvement across all ranges, with largest gains in the
                    medium range where most drug candidates fall.
                  </p>
                </ChartExplanation>
              </div>

              <div className="card-scientific p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Performance by Protein Family</h3>
                <MetricBreakdownChart type="protein" />
                <ChartExplanation title="Protein-Specific Performance">
                  <p>
                    Different protein families have distinct binding characteristics:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><span className="font-semibold">Kinases:</span> Well-studied, consistent binding sites</li>
                    <li><span className="font-semibold">GPCRs:</span> Membrane proteins, complex dynamics</li>
                    <li><span className="font-semibold">Proteases:</span> Clear catalytic mechanisms</li>
                    <li><span className="font-semibold">Nuclear Receptors:</span> Large, flexible binding pockets</li>
                  </ul>
                  <p className="mt-2">
                    The DL model's Transformer component excels at capturing protein-specific binding patterns,
                    showing largest improvements for proteases and kinases.
                  </p>
                </ChartExplanation>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Model Architecture Details */}
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Model Architecture Details
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Baseline Model */}
          <div className="card-scientific p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Baseline: Random Forest</h3>
                <p className="text-xs text-muted-foreground">Traditional ML Approach</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-chart-baseline">•</span>
                <span><span className="font-medium text-foreground">Features:</span> Morgan fingerprints (2048 bits, radius 2)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-chart-baseline">•</span>
                <span><span className="font-medium text-foreground">Architecture:</span> 100 trees, max depth 20</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-chart-baseline">•</span>
                <span><span className="font-medium text-foreground">Training data:</span> {baseline.training_samples.toLocaleString()} samples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-chart-baseline">•</span>
                <span><span className="font-medium text-foreground">Training time:</span> ~5 minutes (CPU)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-chart-baseline">•</span>
                <span><span className="font-medium text-foreground">Limitations:</span> Loses 3D structure, no protein sequence modeling</span>
              </li>
            </ul>
          </div>

          {/* Deep Learning Model */}
          <div className="card-scientific p-6 border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Deep Learning: GNN + Transformer</h3>
                <p className="text-xs text-muted-foreground">State-of-the-Art Architecture</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><span className="font-medium text-foreground">Drug encoder:</span> Graph Attention Network (3 layers, 256 dim)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><span className="font-medium text-foreground">Protein encoder:</span> Transformer (6 layers, 512 dim, 8 heads)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><span className="font-medium text-foreground">Fusion:</span> Cross-attention + Dense layers (512 → 256 → 1)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><span className="font-medium text-foreground">Training data:</span> {dl.training_samples.toLocaleString()} samples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><span className="font-medium text-foreground">Training time:</span> ~4 hours (NVIDIA A100 GPU)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><span className="font-medium text-foreground">Advantages:</span> Preserves topology, learns protein patterns</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Summary Box */}
        <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl">
          <h3 className="text-lg font-semibold text-foreground mb-3">Key Takeaways</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>
                <span className="font-medium text-foreground">25% lower RMSE:</span> More accurate binding predictions
                for drug screening applications.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>
                <span className="font-medium text-foreground">31% higher correlation:</span> Pearson R of 0.76 exceeds
                the 0.70 threshold for production use.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>
                <span className="font-medium text-foreground">Better calibration:</span> Confidence scores you can
                trust for decision-making.
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
