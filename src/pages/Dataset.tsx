import { useState } from "react";
import {
  Database,
  Download,
  ExternalLink,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { AppLayout } from "@/components/layout/AppLayout";
import { toast } from "sonner";
import { exportDatasetEntries } from "@/lib/exportUtils";
import { FilterPanel, DatasetFilters } from "@/components/dataset/FilterPanel";
import { SAMPLE_DATASET, DATASET_STATS, DATASET_LINKS } from "@/data/datasetSamples";

export default function Dataset() {
  const [filters, setFilters] = useState<DatasetFilters>({
    searchQuery: '',
    source: 'all',
    pkMin: 0,
    pkMax: 15,
    showInvalid: false,
    proteinCategory: 'all',
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Apply all filters
  const filteredData = SAMPLE_DATASET.filter(item => {
    // Search query (drug name, target, SMILES)
    const matchesSearch =
      filters.searchQuery === '' ||
      item.smiles.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (item.drugName && item.drugName.toLowerCase().includes(filters.searchQuery.toLowerCase()));

    // Data source filter
    const matchesSource = filters.source === 'all' || item.source === filters.source;

    // pK range filter
    const matchesPkRange = item.pk === null || (item.pk >= filters.pkMin && item.pk <= filters.pkMax);

    // Valid/Invalid filter
    const matchesValid = filters.showInvalid || item.valid;

    // Protein category (simplified - would need protein metadata in real data)
    const matchesProtein = filters.proteinCategory === 'all' ||
      item.target.toLowerCase().includes(filters.proteinCategory.toLowerCase());

    return matchesSearch && matchesSource && matchesPkRange && matchesValid && matchesProtein;
  });

  // Count active filters
  const activeFilterCount = [
    filters.source !== 'all',
    filters.pkMin !== 0 || filters.pkMax !== 15,
    filters.proteinCategory !== 'all',
    filters.showInvalid,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      source: 'all',
      pkMin: 0,
      pkMax: 15,
      showInvalid: false,
      proteinCategory: 'all',
    });
    toast.success('Filters cleared');
  };

  const handleExportCSV = () => {
    const dataToExport = filteredData.length > 0 && filteredData.length < SAMPLE_DATASET.length
      ? filteredData
      : SAMPLE_DATASET;
    exportDatasetEntries(dataToExport, 'csv');
    toast.success(`Dataset with ${dataToExport.length} samples exported as CSV!`);
  };

  const handleExportJSON = () => {
    const dataToExport = filteredData.length > 0 && filteredData.length < SAMPLE_DATASET.length
      ? filteredData
      : SAMPLE_DATASET;
    exportDatasetEntries(dataToExport, 'json');
    toast.success(`Dataset with ${dataToExport.length} samples exported as JSON!`);
  };

  const handleOpenLink = (url: string, name: string, altUrl?: string) => {
    const finalUrl = name === 'PDBbind' ? (altUrl || url) : url;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${name} in new tab`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-full xl:max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Database className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dataset Explorer</h1>
          </div>
          <p className="text-muted-foreground">
            Explore the BindingDB and PDBbind datasets used for training and validation of the DrugBind AI model.
          </p>
        </div>

        {/* External Resources Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            External Data Resources
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Object.values(DATASET_LINKS).map((dataset) => (
              <button
                key={dataset.name}
                onClick={() => handleOpenLink(dataset.url, dataset.name, (dataset as any).altUrl)}
                className="card-scientific p-4 text-left hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                    {dataset.name}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {dataset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Dataset Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card-scientific p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">BindingDB</h3>
              <Badge variant="outline" className="bg-primary/10">Primary Training</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Publicly accessible database of measured binding affinities, focusing on
              drug-like small molecules and drug-target proteins.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total entries:</span>
                <span className="font-mono">{DATASET_STATS.bindingdb.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">After filtering:</span>
                <span className="font-mono">{DATASET_STATS.bindingdb.filtered.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Training samples:</span>
                <span className="font-mono text-primary font-semibold">{DATASET_STATS.bindingdb.afterPreprocessing.toLocaleString()}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 group"
              onClick={() => handleOpenLink(DATASET_LINKS.bindingdb.url, 'BindingDB')}
            >
              <ExternalLink className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
              Visit BindingDB
            </Button>
          </div>

          <div className="card-scientific p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">PDBbind / RCSB PDB</h3>
              <Badge variant="secondary">Validation</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive collection of experimentally measured binding affinity data
              for biomolecular complexes with 3D structural information.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total entries:</span>
                <span className="font-mono">{DATASET_STATS.pdbbind.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">After filtering:</span>
                <span className="font-mono">{DATASET_STATS.pdbbind.filtered.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validation samples:</span>
                <span className="font-mono text-primary font-semibold">{DATASET_STATS.pdbbind.afterPreprocessing.toLocaleString()}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 group"
              onClick={() => handleOpenLink('https://www.rcsb.org/', 'RCSB PDB')}
            >
              <ExternalLink className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
              Visit RCSB Protein Data Bank
            </Button>
          </div>
        </div>

        {/* Preprocessing Pipeline */}
        <div className="card-scientific p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Data Preprocessing Pipeline
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-destructive/10 text-center border border-destructive/20">
              <div className="text-2xl font-bold text-destructive mb-1">8-10%</div>
              <div className="text-xs text-muted-foreground">Invalid SMILES Removed</div>
            </div>
            <div className="p-4 rounded-xl bg-warning/10 text-center border border-warning/20">
              <div className="text-2xl font-bold text-warning mb-1">30-10,000</div>
              <div className="text-xs text-muted-foreground">Amino Acid Length Filter</div>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 text-center border border-primary/20">
              <div className="text-2xl font-bold text-primary mb-1">pK Scale</div>
              <div className="text-xs text-muted-foreground">Kd, Ki, IC50 ΓåÆ pK Conversion</div>
            </div>
            <div className="p-4 rounded-xl bg-success/10 text-center border border-success/20">
              <div className="text-2xl font-bold text-success mb-1">Deduplicated</div>
              <div className="text-xs text-muted-foreground">Duplicate Entries Removed</div>
            </div>
          </div>
        </div>

        {/* Sample Data Explorer */}
        <div className="card-scientific p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h3 className="font-semibold text-foreground">Sample Data Explorer ({SAMPLE_DATASET.length} entries)</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>


          {/* Quick Search & Filter Toggle */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Quick search: drug name, target, SMILES..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilterPanel ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilterPanel ? 'Hide' : 'Show'} Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filter Panel */}
          {showFilterPanel && (
            <div className="mb-4">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-3 text-sm text-muted-foreground">
            Showing {Math.min(filteredData.length, 100)} of {filteredData.length} filtered entries
            {filteredData.length < SAMPLE_DATASET.length && (
              <span className="text-primary ml-1">
                ({SAMPLE_DATASET.length - filteredData.length} filtered out)
              </span>
            )}
          </div>

          {/* Data Table */}
          <div className="border rounded-lg overflow-x-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead className="min-w-[100px]">Drug</TableHead>
                  <TableHead className="min-w-[180px]">SMILES</TableHead>
                  <TableHead className="min-w-[180px]">Target Protein</TableHead>
                  <TableHead className="min-w-[200px]">FASTA (preview)</TableHead>
                  <TableHead className="text-right w-16">pK</TableHead>
                  <TableHead className="w-20">Source</TableHead>
                  <TableHead className="text-right w-16" title="Atom Importance">Atom</TableHead>
                  <TableHead className="text-right w-16" title="Residue Importance">Res</TableHead>
                  <TableHead className="text-right w-16" title="Binding Site Score">Bind</TableHead>
                  <TableHead className="text-right w-16" title="Hydrophobic Score">Hydro</TableHead>
                  <TableHead className="text-right w-16" title="Electrostatic Score">Elec</TableHead>
                  <TableHead className="text-right w-16" title="H-Bond Score">H-Bond</TableHead>
                  <TableHead className="text-right w-16" title="Van der Waals">VdW</TableHead>
                  <TableHead className="text-right w-16" title="Solvation Score">Solv</TableHead>
                  <TableHead className="text-right w-16" title="Entropy Score">Ent</TableHead>
                  <TableHead className="text-right w-20" title="Overall Confidence">Conf</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 100).map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="text-xs font-medium">{item.drugName || 'ΓÇö'}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[180px] truncate" title={item.smiles}>
                      {item.smiles.slice(0, 30)}...
                    </TableCell>
                    <TableCell className="text-xs max-w-[180px] truncate" title={item.target}>{item.target}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate" title={item.fasta}>
                      {item.fasta.slice(0, 25)}...
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-xs">
                      {item.pk !== null ? item.pk.toFixed(1) : 'ΓÇö'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.source === 'BindingDB' ? 'default' : 'secondary'} className="text-xs">
                        {item.source.slice(0, 6)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.atomImportance.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.residueImportance.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.bindingSiteScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.hydrophobicScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.electrostaticScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.hydrogenBondScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.vanDerWaalsScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.solvationScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.entropyScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-primary">{item.overallConfidence.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.valid ? (
                        <span className="status-badge-success text-xs">Valid</span>
                      ) : (
                        <span className="status-badge-error flex items-center gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          Invalid
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Showing {Math.min(filteredData.length, 100)} of {filteredData.length} filtered entries (total: {SAMPLE_DATASET.length.toLocaleString()} samples).
            Export CSV to get all 10,000 samples with complete FASTA sequences and all importance columns.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
