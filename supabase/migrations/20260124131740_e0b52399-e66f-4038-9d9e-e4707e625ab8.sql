-- Create predictions table to store prediction history
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  smiles TEXT NOT NULL,
  fasta TEXT NOT NULL,
  predicted_pk DECIMAL(10, 4) NOT NULL,
  confidence_score DECIMAL(5, 4) NOT NULL,
  atom_importance JSONB,
  residue_importance JSONB,
  drug_name TEXT,
  protein_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for demo purposes)
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view predictions" 
ON public.predictions 
FOR SELECT 
USING (true);

-- Create policy for public insert access
CREATE POLICY "Anyone can create predictions" 
ON public.predictions 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_predictions_created_at ON public.predictions(created_at DESC);