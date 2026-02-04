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
import { SAMPLE_MOLECULES } from "@/lib/api";

interface MoleculeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MoleculeInput({ value, onChange, disabled }: MoleculeInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChange(content.trim());
        validateSmiles(content.trim());
      };
      reader.readAsText(file);
    }
  };

  const validateSmiles = (smiles: string) => {
    // Basic SMILES validation - check for valid characters
    const validChars = /^[A-Za-z0-9@+\-\[\]()=#%\/\\.*]+$/;
    setIsValid(smiles.length > 0 && validChars.test(smiles));
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.length > 0) {
      validateSmiles(newValue);
    } else {
      setIsValid(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Drug SMILES</Label>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled}>
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Examples
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {SAMPLE_MOLECULES.map((mol) => (
                <DropdownMenuItem 
                  key={mol.name}
                  onClick={() => handleChange(mol.smiles)}
                >
                  <span className="font-medium">{mol.name}</span>
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
                accept=".smi,.smiles,.txt"
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
          placeholder="Enter SMILES notation (e.g., CC(=O)OC1=CC=CC=C1C(=O)O)"
          className={`font-mono text-sm min-h-[80px] resize-none ${
            isValid === true ? 'border-success focus-visible:ring-success' : 
            isValid === false ? 'border-destructive focus-visible:ring-destructive' : ''
          }`}
          disabled={disabled}
        />
        {isValid !== null && (
          <div className={`absolute right-3 top-3 text-xs font-medium ${
            isValid ? 'text-success' : 'text-destructive'
          }`}>
            {isValid ? '✓ Valid' : '✗ Invalid'}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        SMILES (Simplified Molecular Input Line Entry System) notation for the drug compound.
      </p>
    </div>
  );
}
