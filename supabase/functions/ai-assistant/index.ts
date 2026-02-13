import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are DrugBind AI Assistant, a helpful and knowledgeable assistant for the DrugBind AI platform.

DrugBind AI is a cutting-edge drug-target interaction prediction platform that uses machine learning to predict binding affinities between drug molecules and protein targets.

Key features you can help users with:
1. **Prediction Page**: Users can input SMILES strings (drug molecules) and FASTA sequences (proteins) to predict binding affinity (pK values). Higher pK means stronger binding.
2. **Explainability Page**: Shows atom-level and residue-level importance heatmaps to understand which parts of molecules/proteins contribute to binding.
3. **Dataset Page**: Contains 500 sample drug-protein interaction records with various importance scores.
4. **Performance Page**: Displays model metrics like MSE, RMSE, R², and Pearson correlation.
5. **Documentation Page**: Technical details about the DrugBindAI model architecture.
6. **AI Molecule Generator**: Generates valid SMILES and FASTA sequences using AI.

Technical terms:
- SMILES: Simplified Molecular-Input Line-Entry System, a text representation of molecular structure
- FASTA: A text format for protein/nucleotide sequences
- pK value: -log10(Kd), where Kd is dissociation constant. Higher pK = stronger binding
- RLS: Row-level security for database protection

Keep responses concise, friendly, and helpful. If users ask about features not related to DrugBind AI, politely redirect them.`;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json() as { messages: Message[] };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
