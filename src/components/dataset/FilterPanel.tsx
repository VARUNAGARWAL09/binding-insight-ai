import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

export interface DatasetFilters {
    searchQuery: string;
    source: string;
    pkMin: number;
    pkMax: number;
    showInvalid: boolean;
    proteinCategory: string;
}

interface FilterPanelProps {
    filters: DatasetFilters;
    onFiltersChange: (filters: DatasetFilters) => void;
    onClearFilters: () => void;
    activeFilterCount: number;
}

export function FilterPanel({
    filters,
    onFiltersChange,
    onClearFilters,
    activeFilterCount,
}: FilterPanelProps) {
    const updateFilter = <K extends keyof DatasetFilters>(
        key: K,
        value: DatasetFilters[K]
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <Card className="p-4 space-y-4 border-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Advanced Filters</h3>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFilterCount} active
                        </Badge>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Search Query */}
                <div className="space-y-2">
                    <Label htmlFor="search" className="text-sm font-medium">
                        Search (Drug, Target, SMILES)
                    </Label>
                    <Input
                        id="search"
                        placeholder="Enter search term..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                    />
                </div>

                {/* Data Source */}
                <div className="space-y-2">
                    <Label htmlFor="source" className="text-sm font-medium">
                        Data Source
                    </Label>
                    <Select
                        value={filters.source}
                        onValueChange={(value) => updateFilter('source', value)}
                    >
                        <SelectTrigger id="source">
                            <SelectValue placeholder="All sources" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="BindingDB">BindingDB</SelectItem>
                            <SelectItem value="PDBbind">PDBbind</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Protein Category */}
                <div className="space-y-2">
                    <Label htmlFor="protein" className="text-sm font-medium">
                        Protein Category
                    </Label>
                    <Select
                        value={filters.proteinCategory}
                        onValueChange={(value) => updateFilter('proteinCategory', value)}
                    >
                        <SelectTrigger id="protein">
                            <SelectValue placeholder="All proteins" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Proteins</SelectItem>
                            <SelectItem value="kinase">Kinases</SelectItem>
                            <SelectItem value="protease">Proteases</SelectItem>
                            <SelectItem value="gpcr">GPCRs</SelectItem>
                            <SelectItem value="nuclear_receptor">Nuclear Receptors</SelectItem>
                            <SelectItem value="enzyme">Other Enzymes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* pK Range Slider */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        pK Range
                    </Label>
                    <span className="text-sm text-muted-foreground font-mono">
                        {filters.pkMin.toFixed(1)} - {filters.pkMax.toFixed(1)}
                    </span>
                </div>
                <Slider
                    min={0}
                    max={15}
                    step={0.5}
                    value={[filters.pkMin, filters.pkMax]}
                    onValueChange={(values) => {
                        onFiltersChange({
                            ...filters,
                            pkMin: values[0],
                            pkMax: values[1],
                        });
                    }}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>7.5</span>
                    <span>15</span>
                </div>
            </div>

            {/* Show Invalid Toggle */}
            <div className="flex items-center gap-2 pt-2 border-t">
                <input
                    type="checkbox"
                    id="showInvalid"
                    checked={filters.showInvalid}
                    onChange={(e) => updateFilter('showInvalid', e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="showInvalid" className="text-sm cursor-pointer">
                    Include invalid entries
                </Label>
            </div>
        </Card>
    );
}
