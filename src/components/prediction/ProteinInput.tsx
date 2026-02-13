import { useState } from "react";
import { Upload, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SAMPLE_PROTEINS } from "@/lib/api";

interface ProteinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ProteinInput({ value, onChange, disabled }: ProteinInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [sequenceLength, setSequenceLength] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Remove FASTA header if present
        const sequence = content.replace(/^>.*\n/gm, '').replace(/\s/g, '');
        onChange(sequence);
        validateFasta(sequence);
      };
      reader.readAsText(file);
    }
  };

  const validateFasta = (sequence: string) => {
    // Valid amino acid characters
    const validAA = /^[ACDEFGHIKLMNPQRSTVWY]+$/i;
    const isValidSeq = validAA.test(sequence);
    const length = sequence.length;
    setSequenceLength(length);
    
    // Check length constraints (30-10000 aa as per report)
    const isValidLength = length >= 30 && length <= 10000;
    setIsValid(isValidSeq && isValidLength);
  };

  const handleChange = (newValue: string) => {
    // Clean the sequence
    const cleanedValue = newValue.replace(/^>.*\n/gm, '').replace(/\s/g, '');
    onChange(cleanedValue);
    if (cleanedValue.length > 0) {
      validateFasta(cleanedValue);
    } else {
      setIsValid(null);
      setSequenceLength(0);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Protein FASTA Sequence</Label>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled}>
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Examples
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {SAMPLE_PROTEINS.map((prot) => (
                <DropdownMenuItem 
                  key={prot.name}
                  onClick={() => handleChange(prot.fasta)}
                >
                  <span className="font-medium">{prot.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" asChild disabled={disabled}>
            <label className="cursor-pointer">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload
              <input
                type="file"
                accept=".fasta,.fa,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={disabled}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter protein sequence in FASTA format (e.g., MALKERWG...)"
          className={`font-mono text-sm min-h-[120px] resize-none ${
            isValid === true ? 'border-success focus-visible:ring-success' : 
            isValid === false ? 'border-destructive focus-visible:ring-destructive' : ''
          }`}
          disabled={disabled}
        />
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          {isValid !== null && (
            <span className={`text-xs font-medium ${
              isValid ? 'text-success' : 'text-destructive'
            }`}>
              {isValid ? '✓ Valid' : '✗ Invalid'}
            </span>
          )}
          {sequenceLength > 0 && (
            <span className="text-xs text-muted-foreground">
              {sequenceLength} aa
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Protein sequence (30-10,000 amino acids). Standard single-letter amino acid codes.
      </p>
    </div>
  );
}
