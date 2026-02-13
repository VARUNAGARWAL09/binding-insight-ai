import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { ArrowUpDown, Search, Download, FileSpreadsheet } from 'lucide-react';
import { BatchResult } from '@/types/batchTypes';
import { exportToCSV } from '@/lib/exportUtils';
import * as XLSX from 'xlsx';

interface BatchResultsTableProps {
    results: BatchResult[];
}

type SortField = 'drug_name' | 'protein_name' | 'predicted_pk' | 'confidence' | 'status';
type SortDirection = 'asc' | 'desc';

export default function BatchResultsTable({ results }: BatchResultsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('predicted_pk');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Filter and sort results
    const filteredResults = useMemo(() => {
        let filtered = results.filter(result =>
            result.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.protein_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.status.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort
        filtered.sort((a, b) => {
            let aVal: any = a[sortField];
            let bVal: any = b[sortField];

            // Handle null values
            if (aVal === null) aVal = -Infinity;
            if (bVal === null) bVal = -Infinity;

            if (typeof aVal === 'string') {
                return sortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return filtered;
    }, [results, searchTerm, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const handleExportCSV = () => {
        const exportData = filteredResults.map(r => ({
            'Drug Name': r.drug_name,
            'Protein Name': r.protein_name,
            'SMILES': r.smiles,
            'FASTA': r.fasta,
            'Predicted pK': r.predicted_pk?.toFixed(2) || 'N/A',
            'Confidence': r.confidence ? `${r.confidence.toFixed(1)}%` : 'N/A',
            'Status': r.status,
            'Error': r.error || '',
            'Timestamp': new Date(r.timestamp).toLocaleString()
        }));
        exportToCSV(exportData, `batch_results_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            filteredResults.map(r => ({
                'Drug Name': r.drug_name,
                'Protein Name': r.protein_name,
                'SMILES': r.smiles,
                'FASTA': r.fasta,
                'Predicted pK': r.predicted_pk?.toFixed(2) || 'N/A',
                'Confidence': r.confidence ? `${r.confidence.toFixed(1)}%` : 'N/A',
                'Status': r.status,
                'Error': r.error || '',
                'Timestamp': new Date(r.timestamp).toLocaleString()
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Batch Results');
        XLSX.writeFile(workbook, `batch_results_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getStatusBadge = (status: BatchResult['status']) => {
        const variants = {
            pending: 'secondary',
            processing: 'default',
            success: 'default',
            failed: 'destructive'
        } as const;

        const colors = {
            pending: 'bg-gray-500',
            processing: 'bg-blue-500',
            success: 'bg-green-500',
            failed: 'bg-red-500'
        };

        return (
            <Badge variant={variants[status]} className={colors[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <Card className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Batch Results</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {filteredResults.length} of {results.length} results
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportCSV}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportExcel}
                            className="gap-2"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Export Excel
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by drug, protein, or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('drug_name')}
                                            className="gap-1 hover:bg-transparent"
                                        >
                                            Drug
                                            <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('protein_name')}
                                            className="gap-1 hover:bg-transparent"
                                        >
                                            Protein
                                            <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('predicted_pk')}
                                            className="gap-1 hover:bg-transparent"
                                        >
                                            Predicted pK
                                            <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('confidence')}
                                            className="gap-1 hover:bg-transparent"
                                        >
                                            Confidence
                                            <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('status')}
                                            className="gap-1 hover:bg-transparent"
                                        >
                                            Status
                                            <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredResults.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No results found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredResults.map((result) => (
                                        <TableRow key={result.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{result.drug_name}</TableCell>
                                            <TableCell>{result.protein_name}</TableCell>
                                            <TableCell>
                                                {result.predicted_pk !== null ? (
                                                    <span className="font-mono">{result.predicted_pk.toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {result.confidence !== null ? (
                                                    <span className="font-mono">
                                                        {result.confidence.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(result.status)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </Card>
    );
}
